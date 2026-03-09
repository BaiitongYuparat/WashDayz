/*
  Warnings:

  - You are about to drop the column `Status` on the `Rider` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RiderStatus" AS ENUM ('AVAILABLE', 'PICKING_UP', 'DELIVERING', 'OFFLINE');

-- AlterTable
ALTER TABLE "Rider" DROP COLUMN "Status",
ADD COLUMN     "status" "RiderStatus" NOT NULL DEFAULT 'AVAILABLE';
