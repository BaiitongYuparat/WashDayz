import { useEffect, useState } from "react";
import { getService, deleteAddonService, deleteMainService, updateMainService, updateAddonService } from "../api/serviceApi";
import type { ServiceResponse } from "../api/serviceApi";
import { FaTrash, FaEdit } from "react-icons/fa";
import SearchInput from "../components/SearchInput";

function Services() {

    const [service, setService] = useState<ServiceResponse>({
        main: [],
        addon: []
    });
    const [search, setSearch] = useState("");
    // const [relations, setRelations] = useState<ServiceRelation[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getService();
            setService(data);
        };

        fetchData();
    }, []);

    const filteredMain = service.main.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    );

    const filteredAddon = service.addon.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeleteMain = async (id: string) => {
        if (!confirm("Delete this service?")) return;

        await deleteMainService(id);

        setService((prev) => ({
            ...prev,
            main: prev.main.filter((item) => item.main_service_id !== id)
        }));
    };

    const handleDeleteAddon = async (id: string) => {
        if (!confirm("Delete this addon?")) return;

        await deleteAddonService(id);

        setService((prev) => ({
            ...prev,
            addon: prev.addon.filter((item) => item.addon_service_id !== id)
        }));
    };

    // useEffect(() => {
    //     getServiceRelations().then(setRelations);
    // }, []);



    return (
        <div className="p-8 space-y-12">
            {/* <div>
                <label className="text-black text-3xl font-bold block mb-4">
                    Service
                </label>

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search user..."
                />

                <div className="overflow-hidden rounded-xl shadow-md mt-4">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">MainService</th>
                                <th className="p-5 text-left">AddonService</th>
                                <th className="p-5 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>  
                            {relations.map((item) => (
                                <tr key={`${item.main_service_id}-${item.addon_service_id}`}>
                                    <td className="p-4">{item.mainService.name}</td>
                                    <td className="p-4">{item.addonService.name}</td>
                                    <td className="p-5"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> */}
            <div>
                <label className="text-black text-3xl font-bold block mb-4">
                    MainService
                </label>

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search user..."
                />

                <div className="overflow-hidden rounded-xl shadow-md mt-4">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">Name</th>
                                <th className="p-5 text-left">Description</th>
                                <th className="p-5 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredMain.map((item) => (
                                <tr key={item.main_service_id}>
                                    <td className="p-4">{item.name}</td>
                                    <td className="p-4">{item.description}</td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => handleDeleteMain(item.main_service_id)}
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

            <div>
                <label className="text-black text-3xl font-bold block mb-4">
                    AddonService
                </label>

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search user..."
                />

                <div className="overflow-hidden rounded-xl shadow-md mt-4">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">Name</th>
                                <th className="p-5 text-left">Description</th>
                                <th className="p-5 text-left">Price</th>
                                <th className="p-5 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredAddon.map((item) => (
                                <tr key={item.addon_service_id}>
                                    <td className="p-4">{item.name}</td>
                                    <td className="p-4">{item.description}</td>
                                    <td className="p-4">{item.price}</td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => handleDeleteAddon(item.addon_service_id)}
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

        </div>
    );
}

export default Services;