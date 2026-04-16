import { useEffect, useState, useCallback } from "react"
import { getQueues} from "../api/queueApi"
import type {Queue }  from "../api/queueApi"

type FilterStatus = "all" | "waiting" | "inprogress" | "done"
type FilterType = "all" | "WASHER" | "DRYER"

function getStatus(q: Queue): "waiting" | "inprogress" | "done" {
  if (q.finished_at) return "done"
  if (q.branch_machine_id) return "inprogress" // ✅ ใช้ตัวนี้แทน
  return "waiting"
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "-"
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}วิที่แล้ว`
  if (diff < 3600) return `${Math.floor(diff / 60)}นาทีที่แล้ว`
  return `${Math.floor(diff / 3600)}ชม.ที่แล้ว`
}

function getInitials(name?: string): string {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

const STATUS_LABEL: Record<string, string> = {
  waiting: "รอ",
  inprogress: "กำลังใช้",
  done: "เสร็จแล้ว",
}

const STATUS_STYLE: Record<string, string> = {
  waiting:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  inprogress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
}

const TYPE_STYLE: Record<string, string> = {
  WASHER: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  DRYER: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
}

export default function QueueMonitor() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [filterBranch, setFilterBranch] = useState<string>("")

  const fetchQueues = useCallback(async () => {
    try {
      setError(null)
      const data = await getQueues(filterBranch || undefined)
      setQueues(data)
      setLastUpdated(new Date().toLocaleTimeString("th-TH"))
    } catch (e) {
      setError("ไม่สามารถโหลดข้อมูลคิวได้")
    } finally {
      setLoading(false)
    }
  }, [filterBranch])

  useEffect(() => {
    fetchQueues()
    const interval = setInterval(fetchQueues, 30000)
    return () => clearInterval(interval)
  }, [fetchQueues])

  const branches = [...new Set(queues.map((q) => q.branch_id))].map(
    (id) => ({ id, name: (queues.find((q) => q.branch_id === id) as any)?.branch_name || id })
  )

  const filtered = queues.filter((q) => {
    const status = getStatus(q)
    if (filterStatus !== "all" && status !== filterStatus) return false
    if (filterType !== "all" && q.machine_type !== filterType) return false
    return true
  })

  const total = queues.length
  const waiting = queues.filter((q) => getStatus(q) === "waiting").length
  const inprogress = queues.filter((q) => getStatus(q) === "inprogress").length
  const done = queues.filter((q) => getStatus(q) === "done").length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Queue Monitor
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              อัปเดตล่าสุด: {lastUpdated || "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="text-sm border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกสาขา</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={fetchQueues}
              className="text-sm px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              ↻ รีเฟรช
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "คิวทั้งหมด", value: total, color: "text-gray-900 dark:text-white" },
            { label: "รอดำเนินการ", value: waiting, color: "text-amber-600 dark:text-amber-400" },
            { label: "กำลังใช้งาน", value: inprogress, color: "text-blue-600 dark:text-blue-400" },
            { label: "เสร็จแล้ว", value: done, color: "text-green-600 dark:text-green-400" },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4"
            >
              <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">{m.label}</div>
              <div className={`text-3xl font-semibold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {(["all", "waiting", "inprogress", "done"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                filterStatus === f
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                  : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
              }`}
            >
              {f === "all" ? "ทั้งหมด" : STATUS_LABEL[f]}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />
          {(["all", "WASHER", "DRYER"] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                filterType === t
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                  : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
              }`}
            >
              {t === "all" ? "ทุกประเภท" : t === "WASHER" ? "เครื่องซัก" : "เครื่องอบ"}
            </button>
          ))}
        </div>

        {/* Queue List */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">รายการคิว</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">{filtered.length} รายการ</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">กำลังโหลด...</div>
          ) : error ? (
            <div className="py-16 text-center text-sm text-red-400">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">ไม่มีคิวในขณะนี้</div>
          ) : (
            <ul>
              {filtered.map((q, i) => {
                const status = getStatus(q)
                const userName = (q as any).order?.user?.name || (q as any).order?.user?.email || "ผู้ใช้งาน"
                const branchName = (q as any).branch?.name || q.branch_id
                return (
                  <li
                    key={q.queue_id}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      i !== filtered.length - 1 ? "border-b border-gray-50 dark:border-zinc-800" : ""
                    }`}
                  >
                    {/* Queue number */}
                    <div className="text-2xl font-semibold text-gray-300 dark:text-zinc-600 w-10 text-center tabular-nums">
                      {q.queue_number}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                      {getInitials(userName)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</div>
                      <div className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate">{branchName}</div>
                    </div>

                    {/* Badges + time */}
                    <div className="flex items-center gap-2 shrink-0">
                      {q.machine_type && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[q.machine_type]}`}>
                          {q.machine_type === "WASHER" ? "เครื่องซัก" : "เครื่องอบ"}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500 w-20 text-right">
                        {timeAgo(q.created_at)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
