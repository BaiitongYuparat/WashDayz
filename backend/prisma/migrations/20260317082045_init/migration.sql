/*
  Warnings:

  - You are about to drop the column `transaction_ref` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "transaction_ref";
