/**
 * Copies the whole production Turso database into a local SQLite file.
 * Read-only on Turso.  Usage: npx tsx scripts/backup-turso.ts [--url libsql://...]
 * Output: backups/prod-<timestamp>.db
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

const args = process.argv.slice(2);
const urlArg = args.indexOf('--url');
const url = urlArg >= 0 ? args[urlArg + 1] : process.env.TURSO_DATABASE_URL;
if (!url) throw new Error('TURSO_DATABASE_URL not set');

const source = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.mkdirSync('backups', { recursive: true });
const file = path.join('backups', `prod-${stamp}.db`);
const target = createClient({ url: `file:${file}` });

const objects = (await source.execute(
  `SELECT type, name, sql FROM sqlite_master
   WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' AND name NOT LIKE 'libsql_%'
   ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END`
)).rows;

// Tables first, then indexes
for (const o of objects) await target.execute(String(o.sql));

for (const o of objects.filter(o => o.type === 'table')) {
  const rs = await source.execute(`SELECT * FROM "${o.name}"`);
  if (rs.rows.length === 0) { console.log(`${o.name}: 0 rows`); continue; }
  const cols = rs.columns.map(c => `"${c}"`).join(', ');
  const placeholders = rs.columns.map(() => '?').join(', ');
  await target.batch(
    rs.rows.map(r => ({ sql: `INSERT INTO "${o.name}" (${cols}) VALUES (${placeholders})`, args: rs.columns.map(c => r[c]) })),
    'write',
  );
  console.log(`${o.name}: ${rs.rows.length} rows`);
}

console.log(`\nBackup written to ${file}`);
