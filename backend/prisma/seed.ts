import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, MachineType, MachineStatus } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const branch1 = await prisma.branch.create({
    data: {
      branch_name: "สาขาสยาม",
      lat_branch: 13.7455,
      lng_branch: 100.5331,
      machine: {
        create: [
          { type: MachineType.WASHER, capacity: 10, status: MachineStatus.AVAILABLE },
          { type: MachineType.WASHER, capacity: 10, status: MachineStatus.AVAILABLE },
          { type: MachineType.DRYER,  capacity: 10, status: MachineStatus.AVAILABLE },
        ],
      },
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      branch_name: "สาขาอโศก",
      lat_branch: 13.7367,
      lng_branch: 100.5602,
      machine: {
        create: [
          { type: MachineType.WASHER, capacity: 10, status: MachineStatus.AVAILABLE },
          { type: MachineType.DRYER,  capacity: 10, status: MachineStatus.AVAILABLE },
        ],
      },
    },
  });

  console.log("Seeded:", branch1.branch_name, branch2.branch_name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());