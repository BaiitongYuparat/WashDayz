/*
  Warnings:

  - You are about to drop the column `rider_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Rider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_rider_id_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "rider_id";

-- DropTable
DROP TABLE "Rider";
