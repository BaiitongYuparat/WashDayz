import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createService = async (req: Request, res: Response) => {
  const { main_service_id, addon_service_id } = req.body;

  try {
    const service = await prisma.service.create({
      data: {
        main_service_id,
        addon_service_id,
      },
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