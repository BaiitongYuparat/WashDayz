/*
  Warnings:

  - The primary key for the `AddonService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `addon_service_id` column on the `AddonService` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `branch_id` column on the `Branch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MainService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `main_service_id` column on the `MainService` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `order_id` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `order_item_id` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OrderItemAddon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `OrderItemAddon` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `payment_id` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Rider` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `rider_id` column on the `Rider` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `user_id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserAddress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `address_id` column on the `UserAddress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `user_id` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `rider_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `branch_id` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `order_id` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `main_service_id` on the `OrderItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `order_item_id` on the `OrderItemAddon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `addon_service_id` on the `OrderItemAddon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `order_id` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `UserAddress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_rider_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_main_service_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_order_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemAddon" DROP CONSTRAINT "OrderItemAddon_addon_service_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemAddon" DROP CONSTRAINT "OrderItemAddon_order_item_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_order_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_user_id_fkey";

-- AlterTable
ALTER TABLE "AddonService" DROP CONSTRAINT "AddonService_pkey",
DROP COLUMN "addon_service_id",
ADD COLUMN     "addon_service_id" SERIAL NOT NULL,
ADD CONSTRAINT "AddonService_pkey" PRIMARY KEY ("addon_service_id");

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
DROP COLUMN "branch_id",
ADD COLUMN     "branch_id" SERIAL NOT NULL,
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("branch_id");

-- AlterTable
ALTER TABLE "MainService" DROP CONSTRAINT "MainService_pkey",
DROP COLUMN "main_service_id",
ADD COLUMN     "main_service_id" SERIAL NOT NULL,
ADD CONSTRAINT "MainService_pkey" PRIMARY KEY ("main_service_id");

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "order_id",
ADD COLUMN     "order_id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "rider_id",
ADD COLUMN     "rider_id" INTEGER NOT NULL,
DROP COLUMN "branch_id",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id");

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_pkey",
DROP COLUMN "order_item_id",
ADD COLUMN     "order_item_id" SERIAL NOT NULL,
DROP COLUMN "order_id",
ADD COLUMN     "order_id" INTEGER NOT NULL,
DROP COLUMN "main_service_id",
ADD COLUMN     "main_service_id" INTEGER NOT NULL,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("order_item_id");

-- AlterTable
ALTER TABLE "OrderItemAddon" DROP CONSTRAINT "OrderItemAddon_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "order_item_id",
ADD COLUMN     "order_item_id" INTEGER NOT NULL,
DROP COLUMN "addon_service_id",
ADD COLUMN     "addon_service_id" INTEGER NOT NULL,
ADD CONSTRAINT "OrderItemAddon_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_pkey",
DROP COLUMN "payment_id",
ADD COLUMN     "payment_id" SERIAL NOT NULL,
DROP COLUMN "order_id",
ADD COLUMN     "order_id" INTEGER NOT NULL,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id");

-- AlterTable
ALTER TABLE "Rider" DROP CONSTRAINT "Rider_pkey",
DROP COLUMN "rider_id",
ADD COLUMN     "rider_id" SERIAL NOT NULL,
ADD CONSTRAINT "Rider_pkey" PRIMARY KEY ("rider_id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "user_id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_pkey",
DROP COLUMN "address_id",
ADD COLUMN     "address_id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_order_id_key" ON "Payment"("order_id");

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "Rider"("rider_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_main_service_id_fkey" FOREIGN KEY ("main_service_id") REFERENCES "MainService"("main_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAddon" ADD CONSTRAINT "OrderItemAddon_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "OrderItem"("order_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAddon" ADD CONSTRAINT "OrderItemAddon_addon_service_id_fkey" FOREIGN KEY ("addon_service_id") REFERENCES "AddonService"("addon_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;
