/**
 * Applies pending Prisma migrations to a libSQL/Turso database (prisma migrate can't target Turso).
 *
 *   npx tsx scripts/migrate-turso.ts [--url <libsql://...|file:path>] [--baseline <migration>] [--after <file.sql>] [--dry-run]
 *
 * - Tracks applied migrations in `_app_migrations`.
 * - `--baseline X` (first run only): treats X and every earlier migration as already applied.
 * - `--after file.sql`: one-off data script appended to the same batch.
 * - Everything runs in ONE `client.migrate()` batch (foreign keys off, atomic): it all applies or nothing does.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient, type InStatement } from '@libsql/client';

const MIGRATIONS_DIR = path.join('prisma', 'migrations');

// ---------- args ----------
const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const url = opt('--url') ?? process.env.TURSO_DATABASE_URL;
const baseline = opt('--baseline');
const afterFile = opt('--after');
const dryRun = args.includes('--dry-run');
if (!url) throw new Error('No --url and TURSO_DATABASE_URL is not set');

const client = createClient({ url, authToken: url.startsWith('file:') ? undefined : process.env.TURSO_AUTH_TOKEN });

// ---------- helpers ----------
/** Splits a migration file into statements. PRAGMAs are dropped: client.migrate() handles foreign keys. */
export function splitSql(sql: string): string[] {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s && !/^PRAGMA\b/i.test(s));
}

/**
 * Data fixes that must run around specific migrations, inside the same batch.
 * Production promotions stored `value` = promotional unit price; 20261022 drops that column.
 * Keep it, then turn it into a FIXED discount (in cents) once 20261116 has converted money to cents.
 */
const HOOKS: Record<string, { before?: string[]; after?: string[] }> = {
  '20261022234254_event_product_relation_promotion_logic_improved_to_three_types': {
    before: [
      `DROP TABLE IF EXISTS "_legacy_promotion_value"`,
      `CREATE TABLE "_legacy_promotion_value" AS SELECT "id", "value" FROM "Promotion"`,
    ],
  },
  '20261116120000_cents_payment_enum_sale_items': {
    after: [
      `UPDATE "Promotion"
         SET "type" = 'FIXED',
             "discountValue" = (
               SELECT MAX(p."value" - CAST(ROUND(l."value" * 100) AS INTEGER), 0)
               FROM "_legacy_promotion_value" l
               JOIN "Product" p ON p."id" = "Promotion"."productId"
               WHERE l."id" = "Promotion"."id"
             )
       WHERE "id" IN (SELECT "id" FROM "_legacy_promotion_value")`,
      `DROP TABLE "_legacy_promotion_value"`,
    ],
  },
};

// ---------- figure out what's pending ----------
const allMigrations = fs
  .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

const trackingExists =
  (await client.execute(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='_app_migrations'`)).rows.length > 0;
const applied = new Set<string>(
  trackingExists ? (await client.execute(`SELECT name FROM _app_migrations`)).rows.map(r => String(r.name)) : [],
);

const baselined: string[] = [];
if (!trackingExists) {
  if (!baseline) throw new Error('No _app_migrations table yet: pass --baseline <last migration already in this database>');
  if (!allMigrations.includes(baseline)) throw new Error(`Unknown baseline migration: ${baseline}`);
  for (const m of allMigrations) {
    if (m > baseline) break;
    baselined.push(m);
    applied.add(m);
  }
}

const pending = allMigrations.filter(m => !applied.has(m));

console.log(`Target: ${url.replace(/\/\/([^.]*)\..*/, '//$1...')}`);
if (baselined.length) console.log(`Baseline: marking ${baselined.length} migrations as already applied (up to ${baseline})`);
console.log(pending.length ? `Pending:\n  ${pending.join('\n  ')}` : 'No pending migrations.');
if (afterFile) console.log(`After-script: ${afterFile}`);

if (pending.length === 0 && !afterFile && baselined.length === 0) process.exit(0);

// ---------- build the batch ----------
const now = new Date().toISOString();
const statements: InStatement[] = [
  `CREATE TABLE IF NOT EXISTS "_app_migrations" ("name" TEXT NOT NULL PRIMARY KEY, "applied_at" DATETIME NOT NULL)`,
  ...baselined.map(name => ({ sql: `INSERT INTO "_app_migrations" VALUES (?, ?)`, args: [name, 'baseline'] })),
];

for (const name of pending) {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name, 'migration.sql'), 'utf8');
  statements.push(...(HOOKS[name]?.before ?? []));
  statements.push(...splitSql(sql));
  statements.push(...(HOOKS[name]?.after ?? []));
  statements.push({ sql: `INSERT INTO "_app_migrations" VALUES (?, ?)`, args: [name, now] });
}
if (afterFile) statements.push(...splitSql(fs.readFileSync(afterFile, 'utf8')));

console.log(`\n${statements.length} statements in one atomic batch.`);
if (dryRun) {
  for (const s of statements) console.log('\n' + (typeof s === 'string' ? s : `${s.sql}  -- ${JSON.stringify(s.args)}`) + ';');
  console.log('\n--dry-run: nothing was written.');
  process.exit(0);
}

await client.migrate(statements);
console.log('Applied.');

// ---------- verification ----------
const q = async (sql: string) => (await client.execute(sql)).rows;
const tables = new Set((await q(`SELECT name FROM sqlite_master WHERE type='table'`)).map(r => String(r.name)));
if (tables.has('SaleItem')) {
  console.log('\nVerification:');
  console.table(await q(`SELECT
    (SELECT COUNT(*) FROM "Sale") AS sales,
    (SELECT COUNT(*) FROM "SaleItem") AS items,
    (SELECT SUM("totalValue") FROM "Sale") AS total_cents,
    (SELECT SUM("totalValue") FROM "SaleItem") AS items_total_cents,
    (SELECT COUNT(*) FROM "Sale" WHERE "eventId" IS NULL) AS sales_without_event`));
  console.table(await q(`SELECT e."name" AS event, COUNT(s."id") AS sales, SUM(s."totalValue") AS cents,
    (SELECT COUNT(*) FROM "_EventToProduct" ep WHERE ep."A" = e."id") AS products
    FROM "Event" e LEFT JOIN "Sale" s ON s."eventId" = e."id" GROUP BY e."id" ORDER BY e."id"`));
  console.table(await q(`SELECT "paymentMethod", COUNT(*) AS n FROM "Sale" GROUP BY 1`));
  console.table(await q(`SELECT pr."name", pr."type", pr."discountValue", p."name" AS product, p."value" AS product_cents
    FROM "Promotion" pr JOIN "Product" p ON p."id" = pr."productId"`));
}
