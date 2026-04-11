import { useEffect, useState } from "react";
import { deleteOrder, getOrders, putOrder, putOrderStatus } from "../api/orderApi"
import type { Order, OrderItem } from "../api/orderApi";
import { FaTrash, FaEdit } from "react-icons/fa";
import SearchInput from "../components/SearchInput";

function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [openeditorder, setOpenEditorder] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);


    //ดึง
    useEffect(() => {
        const fetchRiders = async () => {
            const data = await getOrders();
            console.log(data);
            setOrders(data);
        };

        fetchRiders();
    }, []);

    //ค้นหา
    const filteredOrders = orders.filter((order) => {
        const keyword = search.toLowerCase();
        return (
            order.user?.name?.toLowerCase()?.includes(keyword)
        );
    });

    //ลบออเดอร์
    const handleDelete = async (id: string) => {
        if (!confirm("Delete this order?")) return;
        await deleteOrder(id);
        setOrders(orders.filter((order) => order.order_id !== id));
    };

    //แก้ไขสถานะ
    const handleStatusChange = async (id: string, status: string) => {
        const order = orders.find((o) => o.order_id === id);
        if (!order) return;
        await putOrderStatus(id, {
            status,
        });
        setOrders(orders.map((o) =>
            o.order_id === id ? { ...o, status } : o
        ));
    };

    const handleAddorder = async (id: string, status: string) => {
        const order = orders.find((o) => o.order_id === id);
        if (!order) return;
        await putOrder(id, {
            user_id: order.user_id,
            branch_id: order.branch_id,
            pieces: order.pieces,
            price: order.price,
            status
        });

        setOrders(orders.map((o) =>
            o.order_id === id ? { ...o, status } : o
        ));
    };




    return (
        <div className="p-8">

            <div className="mb-6 flex justify-between items-center">
                <label className="text-black text-3xl font-bold">
                    User
                </label>
            </div>

            {/* Search */}
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search user..."
            />

            <div className="overflow-hidden rounded-xl shadow-md">
                <table className="w-full bg-white border-collapse">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-5 text-left">Order ID</th>
                            <th className="p-5 text-left">Customer Name</th>
                            <th className="p-5 text-left">Laundry Type</th>
                            <th className="p-5 text-left">Price</th>
                            <th className="p-5 text-left">Status</th>
                            <th className="p-5 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr
                                key={order.order_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-5">{order.order_id}</td>
                                <td className="p-5">{order.user?.name || "-"}</td>
                                <td className="p-5">
                                    {order.items?.map((item: OrderItem, index: number) => (
                                        <div key={index}>
                                            {item.machine?.type} {item.machine?.capacity}kg
                                        </div>
                                    ))}
                                </td>
                                <td className="p-5">{order.price}</td>
                                <td className="p-5">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-sm font-semibold
        ${order.status === "WAITING" && "bg-yellow-100 text-yellow-700"}
        ${order.status === "WASHING" && "bg-blue-100 text-blue-700"}
        ${order.status === "FINISHED" && "bg-green-100 text-green-700"}
    `}
                                    >
                                        <option value="WAITING">WAITING</option>
                                        <option value="WASHING">WASHING</option>
                                        <option value="FINISHED">FINISHED</option>
                                    </select>
                                </td>
                                <td className="p-5">
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setOpenEditorder(true);
                                        }}
                                        className="text-yellow-400 text-xl hover:text-yellow-500 transition"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.order_id)}
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
            {openeditorder && selectedOrder && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h2 className="text-xl font-bold">Edit Order</h2>

                        <p>Order ID: {selectedOrder.order_id}</p>
                        <p>Customer: {selectedOrder.user?.name}</p>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setOpenEditorder(false)}
                                className="px-4 py-2 rounded-lg border text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAddorder(selectedOrder.order_id, selectedOrder.status)}
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

export default Orders