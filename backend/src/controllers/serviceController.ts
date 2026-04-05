import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createService = async (req: Request, res: Response) => {
  const { main_service_id, addon_service_id } = req.body;

  // เช็ค input
  if (!main_service_id || !Array.isArray(addon_service_id) || addon_service_id.length === 0) {
    return res.status(400).json({
      error: "main_service_id and addon_service_ids (array) are required",
    });
  }

  try {
    const service = await prisma.service.createMany({
      // map array  แปลงเป็นหลาย row
      data: addon_service_id.map((addon_service_id: string) => ({
        main_service_id,
        addon_service_id,
      })),
      //กัน insert ซ้ำ
      skipDuplicates: true,
    });

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create service relation" });
  }
};


export const getService = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        mainService: true,
        addonService: true,
      },
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  const { main_service_id, addon_service_id } = req.body;

  try {
    const service = await prisma.service.delete({
      where: {
        main_service_id_addon_service_id: {
          main_service_id,
          addon_service_id,
        },
      },
    });

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete service" });
  }
};

// controllers/serviceController.ts
export const getServiceByMainServiceId = async (req: Request, res: Response) => {
  const { main_service_id } = req.query;

  if (!main_service_id) return res.status(400).json({ error: "mainServiceId required" });

  try {
    const services = await prisma.service.findMany({
      where: { main_service_id: String(main_service_id) },
      include: { addonService: true },
    });

    const addons = services.map(s => s.addonService);

    res.json(addons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch addons" });
  }
};