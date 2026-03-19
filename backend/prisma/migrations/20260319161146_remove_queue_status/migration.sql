/*
  Warnings:

  - You are about to drop the column `status` on the `Queue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "status";

-- DropEnum
DROP TYPE "QueueStatus";
