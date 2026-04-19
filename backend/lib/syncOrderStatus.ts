
const MUST_WAIT_FOR: Record<string, string> = {
    DRYER: "WASHER",
}

/**
 * ดู queues ทั้งหมดของ order แล้วคํานวณว่า order ควรเป็น status อะไร
 * เรียกใช้ภายใน $transaction เท่านั้น
 */
export const syncOrderStatus = async (tx: any, order_id: string) => {
    const queues = await tx.queue.findMany({
        where: { order_id }
    })
    if (!queues.length) return

    //ถ้า order ถูกยกเลิก → sync เป็น CANCELLED
    const order = await tx.order.findUnique({ where: { order_id } })
    if (order?.status === "CANCELLED") return

    const allFinished = queues.every((q: any) => q.finished_at !== null)

    // มี queue ที่ได้เครื่องแล้วและยังไม่เสร็จ = กำลังทำงานอยู่
    const anyInProgress = queues.some(
        (q: any) => q.branch_machine_id !== null && q.finished_at === null)

    const allAssigned = queues.every(
        (q: any) => q.branch_machine_id !== null || q.finished_at !== null
    )
    let status: "WAITING" | "WASHING" | "FINISHED"
    if (allFinished) {
        status = "FINISHED"
    } else if (allAssigned) {
        status = "WASHING"
    } else if (anyInProgress) {
        status = "WASHING"  // มีเครื่องทำงานอยู่แม้บางตัวยังรอ
    } else {
        status = "WAITING"
    }

    await tx.order.update({
        where: { order_id },
        data: { status }
    })
}

/**
 * เช็คว่า machineType ของ order นี้ยังถูก block โดย prerequisite อยู่หรือเปล่า
 */
export const isBlockedByDependency = async (
    tx: any,
    order_id: string,
    machineType: string
): Promise<boolean> => {
    const prerequisite = MUST_WAIT_FOR[machineType]
    if (!prerequisite) return false

    // เช็คว่า prerequisite queue มีอยู่และเสร็จแล้วหรือยัง
    const prerequisiteQueue = await tx.queue.findFirst({
        where: {
            order_id,
            machine_type: prerequisite,
        }
    })
    // ถ้าไม่มี prerequisite queue เลย → blocked (ยังไม่ได้สร้าง)
    if (!prerequisiteQueue) return true
    // ถ้ามีแต่ยังไม่เสร็จ → blocked
    if (!prerequisiteQueue.finished_at) return true
    // prerequisite เสร็จแล้ว → ไม่ blocked
    return false
}

/**
 * เมื่อ machine type หนึ่งเสร็จแล้ว ให้ตรวจหา queue ที่รอ dependency อยู่
 * แล้ว assign เครื่องให้ถ้าพร้อม (เช่น WASHER เสร็จ → assign DRYER)
 * เรียกใช้ภายใน $transaction เท่านั้น
 */
export const assignPendingDependentQueues = async (
    tx: any,
    order_id: string,
    branch_id: string,
    finishedMachineType: string
) => {
    // หา type ที่ dependency ตรงกับที่เพิ่งเสร็จ เช่น finishedMachineType = "WASHER" → dependentTypes = ["DRYER"]
    const dependentTypes = Object.entries(MUST_WAIT_FOR)
        .filter(([_, prereq]) => prereq === finishedMachineType)
        .map(([type]) => type)

    for (const depType of dependentTypes) {
        // เช็คว่า prerequisite ทั้งหมดของ order นี้เสร็จหมดแล้วหรือยัง
        const stillBlocked = await isBlockedByDependency(tx, order_id, depType)
        if (stillBlocked) continue

        // หา queue ของ order นี้ที่ยังรอเครื่องอยู่ (blocked อยู่ก่อนหน้า)
        const waitingQueue = await tx.queue.findFirst({
            where: {
                order_id,
                machine_type: depType,
                finished_at: null,
                branch_machine_id: null,
            }
        })
        if (!waitingQueue) continue

        // หาเครื่องว่างของ type นั้นในสาขานั้น
        const availableMachine = await tx.branchMachine.findFirst({
            where: {
                branch_id,
                status: "AVAILABLE",
                machine: { type: depType },
            }
        })

        if (availableMachine) {
            // มีเครื่องว่าง → assign ทันที
            await tx.queue.update({
                where: { queue_id: waitingQueue.queue_id },
                data: {
                    branch_machine_id: availableMachine.branch_machine_id,
                    started_at: new Date(),
                    estimated_start_at: null,
                }
            })
            await tx.branchMachine.update({
                where: { branch_machine_id: availableMachine.branch_machine_id },
                data: { status: "UNAVAILABLE" }
            })
        } else {
            // ไม่มีเครื่องว่าง → คำนวณ estimatedStartAt แล้วรอคิวปกติ
            const machineInfo = await tx.machine.findFirst({
                where: { type: depType }
            })
            const minutesPerCycle = machineInfo?.duration_minutes ?? 30

            const waitingAhead = await tx.queue.count({
                where: {
                    branch_id,
                    machine_type: depType,
                    finished_at: null,
                    branch_machine_id: null,
                    created_at: { lt: waitingQueue.created_at }
                }
            })
            const machinesTotal = await tx.branchMachine.count({
                where: { branch_id, machine: { type: depType } }
            })
            const totalBusyMachines = await tx.branchMachine.count({
                where: {
                    branch_id,
                    machine: { type: depType },
                    status: "UNAVAILABLE"
                }
            })

            const cyclesAhead = Math.ceil((waitingAhead + 1) / (machinesTotal || 1))
            const waitMinutes =
                (cyclesAhead + (totalBusyMachines > 0 ? 1 : 0)) * minutesPerCycle
            const estimatedStartAt = new Date(
                Date.now() + waitMinutes * 60 * 1000
            )

            await tx.queue.update({
                where: { queue_id: waitingQueue.queue_id },
                data: { estimated_start_at: estimatedStartAt }
            })
        }
    }
}