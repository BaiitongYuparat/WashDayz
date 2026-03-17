import { useEffect, useState } from "react";
import { getRider, deleteRider } from "../api/riderApi";
import type { Rider } from "../api/riderApi";
import { FaTrash } from "react-icons/fa";

function Riders() {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [search, setSearch] = useState("");

    // delete rider
    const handleDelete = async (id: string) => {
        if (!confirm("Delete this rider?")) return;

        await deleteRider(id);
        setRiders(riders.filter((rider) => rider.rider_id !== id));
    };

    const filteredRiders = riders.filter((rider) =>
        rider.rider_id.toString().includes(search) || 
        rider.name.toLowerCase().includes(search.toLowerCase()) ||
        rider.phone.includes(search) || 
        rider.license_plate.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const fetchRiders = async () => {
            const data = await getRider();
            console.log(data);
            setRiders(data);
        };

        fetchRiders();
    }, []);

    return (
        <div className="p-8">
            <div className="mb-6">
                <label className="text-black text-3xl font-bold">Rider</label>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search here..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-full border border-gray-300 w-[400px] text-base outline-none focus:ring-2 focus:ring-blue-200"
                />
            </div>

            <div className="overflow-hidden rounded-xl shadow-md">
                <table className="w-full bg-white border-collapse">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-5 text-left">Rider ID</th>
                            <th className="p-5 text-left">Name</th>
                            <th className="p-5 text-left">Phone</th>
                            <th className="p-5 text-left">License Plate</th>
                            <th className="p-5 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredRiders.map((rider) => (
                            <tr
                                key= {rider.rider_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-5">{rider.rider_id}</td>
                                <td className="p-5">{rider.name}</td>
                                <td className="p-5">{rider.phone}</td>
                                <td className="p-5">{rider.license_plate}</td>

                                <td className="p-5">
                                    <button
                                        onClick={() => handleDelete(rider.rider_id)}
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

export default Riders;