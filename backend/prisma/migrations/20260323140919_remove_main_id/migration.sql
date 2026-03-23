/*
  Warnings:

  - You are about to drop the column `main_service_id` on the `AddonService` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddonService" DROP CONSTRAINT "AddonService_main_service_id_fkey";

-- AlterTable
ALTER TABLE "AddonService" DROP COLUMN "main_service_id";
