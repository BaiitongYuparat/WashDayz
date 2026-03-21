import { useEffect, useState } from "react";
import { deleteOrder, getOrders } from "../api/orderApi"
import type { Order, OrderItem } from "../api/orderApi";
import { FaTrash } from "react-icons/fa";
import SearchInput from "../components/SearchInput";

function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchRiders = async () => {
            const data = await getOrders();
            console.log(data);
            setOrders(data);
        };

        fetchRiders();
    }, []);

    const filteredOrders = orders.filter((order) => {
    const keyword = search.toLowerCase();

    return (
        order.user?.name?.toLowerCase()?.includes(keyword) ||
        order.rider?.name?.toLowerCase()?.includes(keyword)
    );
});

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this order?")) return;
        await deleteOrder(id);
        setOrders(orders.filter((order) => order.order_id !== id));
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
                            <th className="p-5 text-left">Rider</th>
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
                                <td className="p-5">{order.rider?.name || "-"}</td>
                                <td className="p-5">
                                    {order.items?.map((item: OrderItem, index: number) => (
                                        <div key={index}>
                                            {item.mainService?.name} x {item.quantity}
                                        </div>
                                    ))}
                                </td>
                                <td className="p-5">{order.price}</td>
                                <td className="p-5">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold
                        ${order.status === "WAITING" &&
                                            "bg-yellow-100 text-yellow-700"
                                            }
                        ${order.status === "PROCESSING" &&
                                            "bg-blue-100 text-blue-700"
                                            }
                        ${order.status === "DONE" &&
                                            "bg-green-100 text-green-700"
                                            }
                      `}
                                    >
                                        {order.status}
                                    </span>
                                </td>

                                <td className="p-5">
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

        </div>
    );
}

export default Orders