import { useEffect, useState, useCallback } from "react"
import { getQueues, deleteQueue } from "../api/queueApi"
import type { Queue } from "../api/queueApi"
import { FaTrash, FaEdit } from "react-icons/fa";

function getStatus(q: Queue): "waiting" | "processing" | "finished" | "cancelled" {
    if (q.cancelled_at) return "cancelled"
    if (q.finished_at) return "finished"
    if (q.branch_machine_id || q.started_at) return "processing"
    return "waiting"
}

const statusLabel: Record<string, { label: string; className: string }> = {
    waiting: { label: "WAITING", className: "bg-amber-100 text-amber-700" },
    processing: { label: "WASHING", className: "bg-blue-100 text-blue-700" },
    finished: { label: "FINISHED", className: "bg-green-100 text-green-700" },
    cancelled: { label: "CANCELLED", className: "bg-red-100 text-red-700" },
}

function Queues() {
    const [queues, setQueues] = useState<Queue[]>([])
    const [loading, setLoading] = useState(true)

    const fetchQueues = useCallback(async () => {
        try {
            const data = await getQueues()
            setQueues(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchQueues()
    }, [fetchQueues])

    const handleDelete = async (queue_id: string) => {
        if (!confirm("ลบคิวนี้?")) return
        await deleteQueue(queue_id)
        fetchQueues()
    }

    const stats = {
        total: queues.length,
        waiting: queues.filter(q => getStatus(q) === "waiting").length,
        processing: queues.filter(q => getStatus(q) === "processing").length,
        finished: queues.filter(q => getStatus(q) === "finished").length,

    }

    return (
        <div className="p-8">
            <div className="mb-6 flex justify-between items-center">
                <label className="text-black text-3xl font-bold">คิว</label>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                    { label: "คิวทั้งหมด", value: stats.total, color: "text-gray-900" },
                    { label: "รอดำเนินการ", value: stats.waiting, color: "text-amber-700" },
                    { label: "กำลังดำเนินการ", value: stats.processing, color: "text-blue-700" },
                    { label: "เสร็จสิ้นวันนี้", value: stats.finished, color: "text-green-700" },
                    { label: "ยกเลิก", value: queues.filter(q => getStatus(q) === "cancelled").length, color: "text-red-700" }
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-2xl font-medium ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl shadow-md">
                <table className="w-full bg-white border-collapse">

                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-5 text-left">ลำดับคิว</th>
                            <th className="p-5 text-left">ผู้ใช้งาน</th>
                            <th className="p-5 text-left">บริการ</th>
                            <th className="p-5 text-left">สาขา</th>
                            <th className="p-5 text-center">ขนาด (กก.)</th>
                            <th className="p-5 text-left">สถานะ</th>
                            <th className="p-5 text-left">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>

                        {queues.map((q) => {
                            const status = getStatus(q)
                            const { label, className } = statusLabel[status]
                            return (
                                <tr key={q.queue_id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="p-5 font-medium">{q.queue_number}</td>
                                    <td className="p-5">{q.order?.user?.name ?? "-"}</td>
                                    <td className="p-5">{q.machine_type ?? "-"}</td>
                                    <td className="p-5">{q.branch?.branch_name ?? "-"}</td>
                                    <td className="p-5 text-center">
                                        {q.order?.items
                                            ?.filter(i => i.machine?.type === q.machine_type)
                                            .map(i => i.machine?.capacity + " กก.")
                                            .join(", ") ?? "-"}
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${className}`}>
                                            {label}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => handleDelete(q.queue_id)}
                                            className="text-red-500 text-xl hover:text-red-700 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Queues