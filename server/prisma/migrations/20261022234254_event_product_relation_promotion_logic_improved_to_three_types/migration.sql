/*
  Warnings:

  - You are about to alter the column `value` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to drop the column `value` on the `Promotion` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_EventToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EventToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" DECIMAL NOT NULL
);
INSERT INTO "new_Product" ("id", "name", "value") SELECT "id", "name", "value" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FIXED',
    "discountValue" DECIMAL,
    "totalValue" DECIMAL,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Promotion" ("id", "minQuantity", "name", "productId") SELECT "id", "minQuantity", "name", "productId" FROM "Promotion";
DROP TABLE "Promotion";
ALTER TABLE "new_Promotion" RENAME TO "Promotion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_EventToProduct_AB_unique" ON "_EventToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToProduct_B_index" ON "_EventToProduct"("B");
