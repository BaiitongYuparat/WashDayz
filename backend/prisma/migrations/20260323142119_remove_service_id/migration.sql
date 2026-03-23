-- CreateTable
CREATE TABLE "Service" (
    "service_id" TEXT NOT NULL,
    "main_service_id" TEXT NOT NULL,
    "addon_service_id" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("service_id")
);

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_main_service_id_fkey" FOREIGN KEY ("main_service_id") REFERENCES "MainService"("main_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_addon_service_id_fkey" FOREIGN KEY ("addon_service_id") REFERENCES "AddonService"("addon_service_id") ON DELETE RESTRICT ON UPDATE CASCADE;
