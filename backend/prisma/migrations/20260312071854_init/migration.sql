/*
  Warnings:

  - The values [PICKING_UP,OFFLINE] on the enum `RiderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WASHING', 'DELIVERING', 'WAITING', 'FINISHED');

-- AlterEnum
BEGIN;
CREATE TYPE "RiderStatus_new" AS ENUM ('AVAILABLE', 'DELIVERING');
ALTER TABLE "public"."Rider" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Rider" ALTER COLUMN "status" TYPE "RiderStatus_new" USING ("status"::text::"RiderStatus_new");
ALTER TYPE "RiderStatus" RENAME TO "RiderStatus_old";
ALTER TYPE "RiderStatus_new" RENAME TO "RiderStatus";
DROP TYPE "public"."RiderStatus_old";
ALTER TABLE "Rider" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'WAITING';
