import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, MachineType, MachineStatus } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());