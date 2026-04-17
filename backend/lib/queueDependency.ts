// src/lib/queueDependency.ts

const MUST_WAIT_FOR: Record<string, string> = {
    DRYER: "WASHER",
}

export const isBlockedByDependency = async (
    tx: any,
    order_id: string,
    machineType: string
): Promise<boolean> => {
    const prerequisite = MUST_WAIT_FOR[machineType]
    if (!prerequisite) return false

    const unfinished = await tx.queue.findFirst({
        where: {
            order_id,
            machine_type: prerequisite,
            finished_at: null,
        }
    })

    return unfinished !== null
}

export const tryUnblockQueues = async (
    tx: any,
    order_id: string,
    branch_id: string | null  
) => {
    if (!branch_id) return  

    const waitingQueues = await tx.queue.findMany({
        where: {
            order_id,
            finished_at: null,
            branch_machine_id: null,
        }
    })

    for (const q of waitingQueues) {
        // ✅ ส่งแค่ 3 args ตรงกับ signature
        const blocked = await isBlockedByDependency(tx, order_id, q.machine_type)
        if (blocked) continue

        const availableMachine = await tx.branchMachine.findFirst({
            where: {
                branch_id,
                status: "AVAILABLE",
                machine: { type: q.machine_type },
            }
        })
        if (!availableMachine) continue

        await tx.queue.update({
            where: { queue_id: q.queue_id },
            data: {
                branch_machine_id: availableMachine.branch_machine_id,
                estimated_start_at: null,
                started_at: new Date()
            }
        })
        await tx.branchMachine.update({
            where: { branch_machine_id: availableMachine.branch_machine_id },
            data: { status: "UNAVAILABLE" }
        })
    }
}