-- AlterTable
ALTER TABLE "AddonService" ADD COLUMN     "main_service_id" TEXT;

-- AddForeignKey
ALTER TABLE "AddonService" ADD CONSTRAINT "AddonService_main_service_id_fkey" FOREIGN KEY ("main_service_id") REFERENCES "MainService"("main_service_id") ON DELETE SET NULL ON UPDATE CASCADE;
