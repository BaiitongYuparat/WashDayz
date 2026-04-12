import { useEffect, useState } from "react";
import { deletePayment, getPayments, putPayment } from "../api/paymentApi";
import type { Payment } from "../api/paymentApi";
import { FaTrash, FaEdit } from "react-icons/fa";
import SearchInput from "../components/SearchInput";

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [openEditPayment, setOpenEditPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await getPayments();
      setPayments(data);
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) =>
    payment.order?.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment?")) return;
    await deletePayment(id);
    setPayments(payments.filter((p) => p.payment_id !== id));
  };

  const handleEditPayment = async (id: string, status: string) => {
    await putPayment(id, { status });
    setPayments(payments.map((p) =>
      p.payment_id === id ? { ...p, status } : p
    ));
  };

  const statusStyle = (status: string) => {
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    if (status === "PAID") return "bg-green-100 text-green-700";
    if (status === "FAILED") return "bg-red-100 text-red-700";
    return "";
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <label className="text-black text-3xl font-bold">Payment</label>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search user..." />

      <div className="overflow-hidden rounded-xl shadow-md">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-5 text-left">Customer Name</th>
              <th className="p-5 text-left">Laundry</th>
              <th className="p-5 text-left">Size</th>
              <th className="p-5 text-left">Branch</th>
              <th className="p-5 text-left">Price</th>
              <th className="p-5 text-left">Status</th>
              <th className="p-5 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.payment_id} className="border-b border-gray-200 hover:bg-gray-50">
                
                <td className="p-5 flex items-center gap-3">
                  <button
                    className="text-yellow-400 text-xl hover:text-yellow-500 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 text-xl hover:text-red-700 transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openEditPayment && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Edit Payment</h2>
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;