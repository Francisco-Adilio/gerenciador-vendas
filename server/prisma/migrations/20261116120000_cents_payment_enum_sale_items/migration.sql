/*
  - Money columns become INTEGER cents (Product.value, Promotion.discountValue/totalValue, Sale.totalValue).
  - Sale.paymentMethod becomes the PaymentMethod enum ('Pix' -> PIX, 'Dinheiro' -> CASH).
  - Sale becomes a header; its product lines move to the new SaleItem table.
    Each existing Sale gets exactly one SaleItem (same id) with its old product/promotion/quantity.
*/

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "unitValue" INTEGER NOT NULL,
    "totalValue" INTEGER NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "promotionId" TEXT,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Move existing sale lines into SaleItem (must run before Product.value / Sale.totalValue are converted)
INSERT INTO "SaleItem" ("id", "saleId", "productId", "promotionId", "quantity", "unitValue", "totalValue")
SELECT s."id", s."id", s."productId", s."promotionId", s."quantity",
       CAST(ROUND(p."value" * 100) AS INTEGER),
       CAST(ROUND(s."totalValue" * 100) AS INTEGER)
FROM "Sale" s
JOIN "Product" p ON p."id" = s."productId";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL
);
INSERT INTO "new_Product" ("id", "name", "value")
SELECT "id", "name", CAST(ROUND("value" * 100) AS INTEGER) FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FIXED',
    "discountValue" INTEGER,
    "totalValue" INTEGER,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Promotion" ("discountValue", "id", "minQuantity", "name", "productId", "totalValue", "type")
SELECT
    CASE WHEN "type" = 'PERCENTAGE' THEN CAST(ROUND("discountValue") AS INTEGER)
         ELSE CAST(ROUND("discountValue" * 100) AS INTEGER) END,
    "id", "minQuantity", "name", "productId",
    CAST(ROUND("totalValue" * 100) AS INTEGER),
    "type"
FROM "Promotion";
DROP TABLE "Promotion";
ALTER TABLE "new_Promotion" RENAME TO "Promotion";
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL,
    "totalValue" INTEGER NOT NULL,
    "eventId" TEXT,
    CONSTRAINT "Sale_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("createdAt", "eventId", "id", "paymentMethod", "totalValue")
SELECT "createdAt", "eventId", "id",
    CASE "paymentMethod"
        WHEN 'Pix' THEN 'PIX'
        WHEN 'Dinheiro' THEN 'CASH'
        WHEN 'PIX' THEN 'PIX'
        WHEN 'CASH' THEN 'CASH'
        WHEN 'CREDIT_CARD' THEN 'CREDIT_CARD'
        WHEN 'DEBIT_CARD' THEN 'DEBIT_CARD'
        ELSE 'PIX'
    END,
    CAST(ROUND("totalValue" * 100) AS INTEGER)
FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
