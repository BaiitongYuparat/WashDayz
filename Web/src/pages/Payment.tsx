import { useEffect, useState } from "react";
import { deletePayment, getPayments, putPayment } from "../api/paymentApi";
import type { Payment } from "../api/paymentApi";
import { FaTrash, FaEdit } from "react-icons/fa";
import { CustomButton } from "../components/Button"

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await getPayments();
      setPayments(data);
    };
    fetchPayments();
  }, []);

  //ค้นหา
  const filteredPayments = payments.filter((payment) =>
    payment.order?.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment?")) return;
    await deletePayment(id);
    setPayments(payments.filter((p) => p.payment_id !== id));
  };

  const statusStyle = (status: string) => {
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    if (status === "PAID") return "bg-green-100 text-green-700";
    if (status === "FAILED") return "bg-red-100 text-red-700";
    return "";
  };

  const handleAddorder = async (id: string, status: string) => {
    const order = payments.find((p) => p.payment_id === id);
    if (!order) return;
    await putPayment(id, { status });
    setPayments(payments.map((p) =>
      p.payment_id === id ? { ...p, status } : p
    ));
  };

  //
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === "PENDING").length,
    paid: payments.filter(p => p.status === "PAID").length,
    failed: payments.filter(p => p.status === "FAILED").length,
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <label className="text-black text-3xl font-bold">การชำระเงิน</label>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "ทั้งหมด", value: stats.total, color: "text-gray-900" },
          { label: "รอชำระ", value: stats.pending, color: "text-amber-700" },
          { label: "ชำระแล้ว", value: stats.paid, color: "text-green-700" },
          { label: "ล้มเหลว", value: stats.failed, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-medium ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl shadow-md">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-5 text-left">ผู้ใช้งาน</th>
              <th className="p-5 text-left">บริการ</th>
              <th className="p-5 text-left">ขนาด (กก.)</th>
              <th className="p-5 text-left">สาขา</th>
              <th className="p-5 text-left">ราคา</th>
              <th className="p-5 text-left">สถานะ</th>
              <th className="p-5 text-left">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.payment_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-5">{payment.order?.user?.name ?? "-"}</td>
                <td className="p-5">
                  {payment.order?.items?.map((item) => item.machine?.type).join(", ") ?? "-"}
                </td>
                <td className="p-5">
                  {payment.order?.items?.map((item) => item.machine?.capacity + " กก").join(" , ") ?? "-"}
                </td>
                <td className="p-5">{payment.order?.branch?.branch_name ?? "-"}</td>
                <td className="p-5">
                  {payment.order?.total_price != null
                    ? `฿${payment.order.total_price.toLocaleString()}`
                    : "-"}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setEditStatus(payment.status);
                      }}
                      className="text-yellow-400 text-xl hover:text-yellow-500 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.payment_id)}
                      className="text-red-500 text-xl hover:text-red-700 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">แก้ไขการชำระเงิน</h2>
            <p>ลูกค้า: {selectedPayment.order?.user?.name}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 ${statusStyle(editStatus)}`}
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CustomButton
                title="ยกเลิก"
                variant="cancel"
                size="md"
                onPress={() => setSelectedPayment(null)}
              />
              <CustomButton
                title="บันทึก"
                variant="primary"
                size="md"
                onPress={() => {
                  handleAddorder(selectedPayment.payment_id, editStatus);
                  setSelectedPayment(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;