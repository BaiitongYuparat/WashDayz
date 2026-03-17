/*
  Warnings:

  - The primary key for the `AddonService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MainService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderItemAddon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Rider` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserAddress` table will be changed. If it partially fails, the table could be left without primary key constraint.

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
ALTER COLUMN "addon_service_id" DROP DEFAULT,
ALTER COLUMN "addon_service_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AddonService_pkey" PRIMARY KEY ("addon_service_id");
DROP SEQUENCE "AddonService_addon_service_id_seq";

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
ALTER COLUMN "branch_id" DROP DEFAULT,
ALTER COLUMN "branch_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("branch_id");
DROP SEQUENCE "Branch_branch_id_seq";

-- AlterTable
ALTER TABLE "MainService" DROP CONSTRAINT "MainService_pkey",
ALTER COLUMN "main_service_id" DROP DEFAULT,
ALTER COLUMN "main_service_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MainService_pkey" PRIMARY KEY ("main_service_id");
DROP SEQUENCE "MainService_main_service_id_seq";

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
ALTER COLUMN "order_id" DROP DEFAULT,
ALTER COLUMN "order_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "rider_id" DROP NOT NULL,
ALTER COLUMN "rider_id" SET DATA TYPE TEXT,
ALTER COLUMN "branch_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id");
DROP SEQUENCE "Order_order_id_seq";

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_pkey",
ALTER COLUMN "order_item_id" DROP DEFAULT,
ALTER COLUMN "order_item_id" SET DATA TYPE TEXT,
ALTER COLUMN "order_id" SET DATA TYPE TEXT,
ALTER COLUMN "main_service_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("order_item_id");
DROP SEQUENCE "OrderItem_order_item_id_seq";

-- AlterTable
ALTER TABLE "OrderItemAddon" DROP CONSTRAINT "OrderItemAddon_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "order_item_id" SET DATA TYPE TEXT,
ALTER COLUMN "addon_service_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrderItemAddon_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OrderItemAddon_id_seq";

-- AlterTable
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_pkey",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "payment_id" DROP DEFAULT,
ALTER COLUMN "payment_id" SET DATA TYPE TEXT,
ALTER COLUMN "order_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id");
DROP SEQUENCE "Payment_payment_id_seq";

-- AlterTable
ALTER TABLE "Rider" DROP CONSTRAINT "Rider_pkey",
ALTER COLUMN "rider_id" DROP DEFAULT,
ALTER COLUMN "rider_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Rider_pkey" PRIMARY KEY ("rider_id");
DROP SEQUENCE "Rider_rider_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "user_id" DROP DEFAULT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");
DROP SEQUENCE "User_user_id_seq";

-- AlterTable
ALTER TABLE "UserAddress" DROP CONSTRAINT "UserAddress_pkey",
ALTER COLUMN "address_id" DROP DEFAULT,
ALTER COLUMN "address_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("address_id");
DROP SEQUENCE "UserAddress_address_id_seq";

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "Rider"("rider_id") ON DELETE SET NULL ON UPDATE CASCADE;

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
