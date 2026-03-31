import { z } from "zod";
import { prisma } from "../../lib/prisma"



const QueryInputSchema = z.object({
    model: z.enum(["User", "Branch", "Machine", "Queue", "Order", "OrderItem", "Payment", "MainService", "AddonService",]), //จำกัดmodel
    action: z.enum(["findMany", "findFirst", "findUnique", "count"]),  //จำกัดaction
    args: z.object({
        where: z.record(z.unknown()).optional(),
        select: z.record(z.boolean()).optional(),
        include: z.record(z.unknown()).optional(),
        orderBy: z.record(z.unknown()).optional(),
        take: z.number().int().positive().max(100).optional(), //จำกัด100แถว
        skip: z.number().int().nonnegative().optional(),
    })
        .optional()
        .default({}),
})

export type QueryInput = z.infer<typeof QueryInputSchema>; // Typescript type สำหรับ input

export async function runQuery(input:unknown) {
    //validate input
    const {model , action , args} = QueryInputSchema.parse(input)
    //เลือก prisma model
    const prismaModel = prisma[model.toLowerCase() as keyof typeof prisma] as any
    if (!prismaModel || typeof prismaModel[action] !== "function") {
        throw new Error(`Invalid model or action: ${model}.${action}`)
    }
    //run query
    const result = await prismaModel[action] (args);
    return result
}

