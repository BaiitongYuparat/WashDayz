import { useEffect, useState } from "react";
import { getBranches } from "../api/branchApi";
import { getOrders } from "../api/orderApi";
import { getPayments } from "../api/paymentApi";
import type { Branch } from "../api/branchApi";
import type { Order } from "../api/orderApi";
import type { Payment } from "../api/paymentApi";

type BranchStat = {
  branch_id: string;
  branch_name: string;
  orderCount: number;
  totalRevenue: number;
};

function Dashboards() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [b, o, p] = await Promise.all([
          getBranches(),
          getOrders(),
          getPayments(),
        ]);
        setBranches(b);
        setOrders(o);
        setPayments(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // --- คำนวณ stats ---
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price ?? 0), 0);
  const totalOrders = orders.length;
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const totalPaid = paidPayments.reduce(
    (sum, p) => sum + (p.order?.total_price ?? 0),
    0
  );

  // จำนวนออเดอร์และยอดรายสาขา
  const branchStatsMap: Record<string, BranchStat> = {};
  orders.forEach((o) => {
    if (!o.branch_id) return;
    if (!branchStatsMap[o.branch_id]) {
      branchStatsMap[o.branch_id] = {
        branch_id: o.branch_id,
        branch_name: o.branch?.branch_name ?? o.branch_id,
        orderCount: 0,
        totalRevenue: 0,
      };
    }
    branchStatsMap[o.branch_id].orderCount += 1;
    branchStatsMap[o.branch_id].totalRevenue += o.total_price ?? 0;
  });

  const branchStats: BranchStat[] = Object.values(branchStatsMap).sort(
    (a, b) => b.orderCount - a.orderCount
  );

  const filtered = branchStats.filter((b) =>
    b.branch_name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "สาขาทั้งหมด",   value: branches.length,            color: "text-gray-900"   },
    { label: "ออเดอร์ทั้งหมด", value: totalOrders,                color: "text-blue-700"   },
    { label: "ยอดเงินรวม",     value: `฿${totalRevenue.toLocaleString()}`, color: "text-gray-900" },
    { label: "ชำระแล้ว",       value: `฿${totalPaid.toLocaleString()}`,    color: "text-green-700" },
    { label: "รายการชำระ",     value: paidPayments.length,        color: "text-green-700"  },
  ];

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <label className="text-black text-3xl font-bold">แดชบอร์ด</label>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-medium ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
 

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow-md">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-5 text-left">ลำดับ</th>
              <th className="p-5 text-left">สาขา</th>
              <th className="p-5 text-left">จำนวนออเดอร์</th>
              <th className="p-5 text-left">ยอดเงิน (฿)</th>
              <th className="p-5 text-left">สัดส่วน</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((branch, i) => {
              const pct = branchStats[0]?.totalRevenue
                ? Math.round((branch.totalRevenue / branchStats[0].totalRevenue) * 100)
                : 0;
              return (
                <tr key={branch.branch_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-5 text-black text-sm">{i + 1}</td>
                  <td className="p-5 font-medium text-gray-800">
                    {branch.branch_name}
                  </td>
                  <td className="p-5">{branch.orderCount.toLocaleString()}</td>
                  <td className="p-5 font-medium">฿{branch.totalRevenue.toLocaleString()}</td>
                  <td className="p-5 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                  ไม่พบสาขาที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>

          {/* Footer */}
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td colSpan={2} className="p-5 text-sm text-gray-500 font-medium">รวมทั้งหมด</td>
              <td className="p-5 font-medium text-gray-800">{totalOrders.toLocaleString()}</td>
              <td className="p-5 font-medium text-gray-800">฿{totalRevenue.toLocaleString()}</td>
              <td className="p-5" />
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}

export default Dashboards;
