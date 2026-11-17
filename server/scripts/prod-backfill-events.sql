-- One-off: production sales predate events. Group them into 3 events by date
-- and link each event to the products it sold. Runs inside the migration batch.

INSERT INTO "Event" ("id", "name") VALUES
  ('evt_2026_06_27', 'Evento 27/06'),
  ('evt_2026_09_06', 'Evento 06/09'),
  ('evt_2026_10_17', 'Evento 17/10');

UPDATE "Sale" SET "eventId" = 'evt_2026_06_27' WHERE "eventId" IS NULL AND "createdAt" < '2026-08-01';
UPDATE "Sale" SET "eventId" = 'evt_2026_09_06' WHERE "eventId" IS NULL AND "createdAt" >= '2026-08-01' AND "createdAt" < '2026-10-01';
UPDATE "Sale" SET "eventId" = 'evt_2026_10_17' WHERE "eventId" IS NULL AND "createdAt" >= '2026-10-01';

-- Products sold in each event
INSERT OR IGNORE INTO "_EventToProduct" ("A", "B")
SELECT DISTINCT s."eventId", i."productId"
FROM "SaleItem" i JOIN "Sale" s ON s."id" = i."saleId"
WHERE s."eventId" IS NOT NULL;

-- Products never sold go to the latest event
INSERT OR IGNORE INTO "_EventToProduct" ("A", "B")
SELECT 'evt_2026_10_17', p."id"
FROM "Product" p
WHERE NOT EXISTS (SELECT 1 FROM "SaleItem" i WHERE i."productId" = p."id");
