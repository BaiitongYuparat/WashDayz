/*
  Warnings:

  - The `status` column on the `Queue` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'CALLED', 'DONE', 'CANCEL');

-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "status",
ADD COLUMN     "status" "QueueStatus" NOT NULL DEFAULT 'WAITING';
