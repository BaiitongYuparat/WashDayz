/*
  Warnings:

  - You are about to drop the column `queue` on the `Branch` table. All the data in the column will be lost.
  - Added the required column `phone` to the `UserAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `UserAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subDistrict` to the `UserAddress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_user_id_fkey";

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "queue";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "RoleStatus" NOT NULL DEFAULT 'USER',
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserAddress" ADD COLUMN     "details" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "subDistrict" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Queue" (
    "queue_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "queue_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "called_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("queue_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Queue_order_id_key" ON "Queue"("order_id");

-- CreateIndex
CREATE INDEX "Queue_branch_id_idx" ON "Queue"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "Queue_branch_id_queue_number_key" ON "Queue"("branch_id", "queue_number");

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;
