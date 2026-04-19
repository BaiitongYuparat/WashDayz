import { useEffect, useState } from "react";
import { getService, deleteAddonService, deleteMainService, updateMainService, uploadAddonImage, updateAddonService, getServiceRelations, createServiceRelation, deleteServiceRelation, createAddonService, createMainService, getMainService } from "../api/serviceApi";
import type { ServiceResponse, ServiceRelation, MainService, AddonService } from "../api/serviceApi";
import { FaTrash, FaEdit } from "react-icons/fa";
import SearchInput from "../components/SearchInput";
import { CustomButton } from "../components/Button"


function Services() {

    const [service, setService] = useState<ServiceResponse>({
        main: [],
        addon: []
    });
    const [search, setSearch] = useState("");
    const [relations, setRelations] = useState<ServiceRelation[]>([]);

    //เเก้ไข
    const [editMain, setEditMain] = useState<MainService | null>(null);
    const [editAddon, setEditAddon] = useState<AddonService | null>(null);
    const [editRelation, setEditRelation] = useState<MainService | null>(null);
    const [editAddonImageFile, setEditAddonImageFile] = useState<File | null>(null);
    const [editAddonImagePreview, setEditAddonImagePreview] = useState<string>("");

    //บันทึกการอัพเดต
    const [formMain, setFormMain] = useState({ name: "", description: "" });
    const [formAddon, setFormAddon] = useState({ name: "", description: "", price: 0, type: "" });
    const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

    //post
    const [newMain, setNewMain] = useState({ name: "", description: "" });
    const [newAddon, setNewAddon] = useState({ name: "", description: "", price: "", type: "" });
    const [newRelationMainId, setNewRelationMainId] = useState("");
    const [newRelationAddonIds, setNewRelationAddonIds] = useState<string[]>([]);
    const [openCreateMain, setOpenCreateMain] = useState(false);
    const [openCreateAddon, setOpenCreateAddon] = useState(false);
    const [openCreateRelation, setOpenCreateRelation] = useState(false);


    // เพิ่ม upphoto
    const [addonImageFile, setAddonImageFile] = useState<File | null>(null);
    const [addonImagePreview, setAddonImagePreview] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            const [data, rel] = await Promise.all([
                getService(),
                getServiceRelations()
            ]);
            setService(data);
            setRelations(rel);
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

    // ลบmain
    const handleDeleteMain = async (id: string) => {
        if (!confirm("Delete this service?")) return;

        await deleteMainService(id);

        setService((prev) => ({
            ...prev,
            main: prev.main.filter((item) => item.main_service_id !== id)
        }));
    };

    //ลบaddon
    const handleDeleteAddon = async (id: string) => {
        if (!confirm("Delete this addon?")) return;

        await deleteAddonService(id);

        setService((prev) => ({
            ...prev,
            addon: prev.addon.filter((item) => item.addon_service_id !== id)
        }));
    };

    const addonsByMain = relations.reduce<Record<string, string[]>>((acc, rel) => { //reduceแปลง array ของrelationsโดยmain_service_id
        if (!acc[rel.main_service_id]) acc[rel.main_service_id] = [];
        acc[rel.main_service_id].push(rel.addonService.name); ////value = addon names array
        return acc;
    }, {});

    const addonIdsByMain = relations.reduce<Record<string, string[]>>((acc, rel) => {
        if (!acc[rel.main_service_id]) acc[rel.main_service_id] = [];
        acc[rel.main_service_id].push(rel.addon_service_id);
        return acc;
    }, {});

    //แก้ไขเมน
    const openEditMain = (item: MainService) => {
        setEditMain(item);
        setFormMain({ name: item.name, description: item.description });
    };
    //
    const handleSaveMain = async () => {
        if (!editMain) return;
        await updateMainService(editMain.main_service_id, { ...formMain });
        setService((prev) => ({
            ...prev,
            main: prev.main.map((m) => m.main_service_id === editMain.main_service_id ? { ...m, ...formMain } : m)
        }));
        setEditMain(null);
    };


    //แก้ไขแอดออน
    const openEditAddon = (item: AddonService) => {
        setEditAddon(item);
        setFormAddon({ name: item.name, description: item.description, price: item.price, type: item.type })
        setEditAddonImagePreview(item.image_url ?? "");
        setEditAddonImageFile(null);
    }
    //
    const handleSaveAddon = async () => {
        if (!editAddon) return;
        let image_url = editAddon.image_url ?? "";  // ใช้รูปเดิมก่อน
        if (editAddonImageFile) {
            image_url = await uploadAddonImage(editAddonImageFile);  // ✅ อัปโหลดรูปใหม่ถ้าเลือก
        }

        await updateAddonService(editAddon.addon_service_id, { name: formAddon.name, description: formAddon.description, price: formAddon.price, type: formAddon.type, image_url });
        setService((prev) => ({
            ...prev,
            addon: prev.addon.map((a) => a.addon_service_id === editAddon.addon_service_id ? { ...a, ...formAddon } : a)
        }));
        setEditAddonImageFile(null);
        setEditAddonImagePreview("");
        setEditAddon(null);
    };

    //แก้ไขของตารางบนสุด
    const openEditRelation = (item: MainService) => {
        setEditRelation(item)
        setSelectedAddonIds(addonIdsByMain[item.main_service_id] ?? []);
    }
    //ติ๊กเลือกแอดออน
    const toggleAddon = (id: string) => {
        setSelectedAddonIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const handleSaveRelation = async () => {
        if (!editRelation) return; //เช็คก่อนว่ามีข้อมูลไหม
        //หาว่า addon ไหนเปลี่ยนแปลง
        const currentIds = addonIdsByMain[editRelation.main_service_id] ?? [];  // addon ที่มีอยู่ตอนนี้ในดาต้า
        const toAdd = selectedAddonIds.filter((id) => !currentIds.includes(id)); // addon ที่เพิ่งติ๊กเพิ่ม
        const toRemove = currentIds.filter((id) => !selectedAddonIds.includes(id)); // addon ที่เพิ่งติ๊กออก 

        //ยิง API เฉพาะที่เปลี่ยน
        await Promise.all([
            ...toAdd.map((id) => createServiceRelation(editRelation.main_service_id, [id])),
            ...toRemove.map((id) => deleteServiceRelation(editRelation.main_service_id, id)),
        ]);

        //อัปเดต state โดยไม่ refetch
        setRelations((prev) => {
            // ลบ relations เก่าของ main นี้ทิ้งก่อน
            const filtered = prev.filter((r) => r.main_service_id !== editRelation.main_service_id);
            // สร้าง relations ใหม่จาก selectedAddonIds ที่ user เลือก
            const newRels = selectedAddonIds.map((id) => ({
                main_service_id: editRelation.main_service_id,
                addon_service_id: id,
                mainService: { name: editRelation.name, description: editRelation.description },
                addonService: service.addon.find((a) => a.addon_service_id === id)!
            }));
            // รวมกลับ  relations ของ main อื่น  relations ใหม่ของ main 
            return [...filtered, ...newRels];
        });
        setEditRelation(null);
    };

    // postข้อมูลใหม่
    const handleMain = async () => {
        await createMainService(newMain);
        const data = await getService();
        setService(data);
        setNewMain({ name: "", description: "" });
        setOpenCreateMain(false);

    }
    const handleRelation = async () => {
        if (!newRelationMainId || newRelationAddonIds.length === 0) return;
        await createServiceRelation(newRelationMainId, newRelationAddonIds);
        const rel = await getServiceRelations();
        setRelations(rel);
        setNewRelationMainId("");
        setNewRelationAddonIds([]);
        setOpenCreateRelation(false);

    }

    const handleCreateAddon = async () => {
        let image_url = "";

        if (addonImageFile) {
            image_url = await uploadAddonImage(addonImageFile); // อัปโหลดก่อน
        }

        await createAddonService({ ...newAddon, image_url });
        const data = await getService();
        setService(data);
        setNewAddon({ name: "", description: "", price: "", type: "" });
        setAddonImageFile(null);
        setAddonImagePreview("");
        setOpenCreateAddon(false);
    };



    return (
        <div className="p-8 space-y-12">
            <div>


                <div className="mb-6 flex justify-between items-center">
                    <label className="text-black text-3xl font-bold">
                        Service
                    </label>

                    <CustomButton
                        title="+ เพิ่มบริการ"
                        variant="primary"
                        size="md"
                        onPress={() => setOpenCreateRelation(true)}
                    />
                    {openCreateRelation && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                                <h2 className="text-xl font-bold">สร้างบริการ</h2>

                                {/* เลือก MainService */}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">บริการหลัก</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={newRelationMainId}
                                        onChange={(e) => setNewRelationMainId(e.target.value)}
                                    >
                                        <option value="">-- เลือกบริการหลัก --</option>
                                        {service.main.map((m) => (
                                            <option key={m.main_service_id} value={m.main_service_id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* AddonService*/}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">บริการเสริม</label>
                                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                                        {service.addon.map((addon) => (
                                            <label key={addon.addon_service_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-blue-500"
                                                    checked={newRelationAddonIds.includes(addon.addon_service_id)}
                                                    onChange={() => toggleAddon(addon.addon_service_id)}
                                                />
                                                <span className="text-sm font-medium">{addon.name}</span>
                                                <span className="text-xs text-gray-400 ml-auto">{addon.price} ฿</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <CustomButton
                                        title="ยกเลิก"
                                        variant="cancel"
                                        size="md"
                                        onPress={() => setOpenCreateRelation(false)}
                                    />
                                    <CustomButton
                                        title="สร้าง"
                                        variant="primary"
                                        size="md"
                                        onPress={handleRelation}
                                        disabled={!newRelationMainId || newRelationAddonIds.length === 0}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl shadow-md mt-4">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">บริการหลัก</th>
                                <th className="p-5 text-left">บริการเสริม</th>
                                <th className="p-5 text-left">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMain.map((item) => (
                                <tr key={item.main_service_id} className="border-t border-gray-100">
                                    <td className="p-4 ">{item.name}</td>
                                    <td className="p-4 ">
                                        {addonsByMain[item.main_service_id]?.join(", ") || "-"}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => openEditRelation(item)}
                                            className="text-yellow-400 text-xl hover:text-yellow-500 transition"
                                        >
                                            <FaEdit />
                                        </button>
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
            {editRelation && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h2 className="text-xl font-bold">แก้ไขบริการเสริม — {editRelation.name}</h2>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {service.addon.map((addon) => (
                                <label key={addon.addon_service_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-500"
                                        checked={selectedAddonIds.includes(addon.addon_service_id)}
                                        onChange={() => toggleAddon(addon.addon_service_id)}
                                    />
                                    <span className="text-sm font-medium">{addon.name}</span>
                                    <span className="text-xs text-gray-400 ml-auto">{addon.price} ฿</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <CustomButton
                                title="ยกเลิก"
                                variant="cancel"
                                size="md"
                                onPress={() => setEditRelation(null)}
                            />
                            <CustomButton
                                title="บันทึก"
                                variant="primary"
                                size="md"
                                onPress={handleSaveRelation}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div>
                <div className="mb-6 flex justify-between items-center">
                    <label className="text-black text-3xl font-bold">
                        Main Service
                    </label>

                    <CustomButton
                        title="+ เพิ่มบริการหลัก"
                        variant="primary"
                        size="md"
                        onPress={() => setOpenCreateMain(true)}
                    />

                    {openCreateMain && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                                <h2 className="text-xl font-bold">สร้างบริการหลัก</h2>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">ชื่อบริการ</label>
                                    <input
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={newMain.name}
                                        onChange={(e) => setNewMain({ ...newMain, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">คำอธิบาย</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={newMain.description}
                                        onChange={(e) => setNewMain({ ...newMain, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <CustomButton
                                        title="ยกเลิก"
                                        variant="cancel"
                                        size="md"
                                        onPress={() => setOpenCreateMain(false)}
                                    />
                                    <CustomButton
                                        title="สร้าง"
                                        variant="primary"
                                        size="md"
                                        onPress={handleMain}
                                    />
                                </div>
                            </div>
                        </div>
                    )}


                </div>
                <div className="overflow-hidden rounded-xl shadow-md mt-4">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">ชื่อบริการ</th>
                                <th className="p-5 text-left">คำอธิบาย</th>
                                <th className="p-5 text-left">การจัดการ</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredMain.map((item) => (
                                <tr key={item.main_service_id}>
                                    <td className="p-4">{item.name}</td>
                                    <td className="p-4">{item.description}</td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => openEditMain(item)}
                                            className="text-yellow-400 text-xl hover:text-yellow-500 transition"
                                        >
                                            <FaEdit />
                                        </button>
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
            {editMain && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h2 className="text-xl font-bold">แก้ไขบริการหลัก</h2>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">ชื่อบริการ</label>
                            <input className="w-full border rounded-lg p-2 text-sm" value={formMain.name} onChange={(e) => setFormMain({ ...formMain, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">คำอธิบาย</label>
                            <textarea className="w-full border rounded-lg p-2 text-sm" value={formMain.description} onChange={(e) => setFormMain({ ...formMain, description: e.target.value })} />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <CustomButton
                                title="ยกเลิก"
                                variant="cancel"
                                size="md"
                                onPress={() => setEditMain(null)}
                            />
                            <CustomButton
                                title="บันทึก"
                                variant="primary"
                                size="md"
                                onPress={handleSaveMain}
                            />
                        </div>
                    </div>
                </div>
            )}



            {/* addon */}
            <div>
                <div className="mb-6 flex justify-between items-center">
                    <label className="text-black text-3xl font-bold">
                        Addon Service
                    </label>

                    <CustomButton
                        title="+ เพิ่มบริการเสริม"
                        variant="primary"
                        size="md"
                        onPress={() => setOpenCreateAddon(true)}

                    />
                    {openCreateAddon && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                                <h2 className="text-xl font-bold">สร้างบริการเสริม</h2>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">ชื่อบริการ</label>
                                    <input
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={newAddon.name}
                                        onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">คำอธิบาย</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={newAddon.description}
                                        onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">ราคา</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={newAddon.price}
                                        onChange={(e) => setNewAddon({ ...newAddon, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">รูปภาพบริการ</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full border rounded-lg p-2 text-sm"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setAddonImageFile(file);
                                                setAddonImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    {addonImagePreview && (
                                        <img
                                            src={addonImagePreview}
                                            className="mt-2 h-24 w-24 object-cover rounded-lg border"
                                        />
                                    )}
                                </div>
                                <select
                                    className="w-full border rounded-lg p-2 text-sm"
                                    value={newAddon.type}
                                    onChange={(e) => setNewAddon({ ...newAddon, type: e.target.value })}
                                >
                                    <option value=""> -- เลือกประเภทบริการ -- </option>
                                    <option value="ADDON">บริการเสริม</option>
                                    <option value="EXTRA">บริการพิเศษ</option>
                                </select>

                                <div className="flex justify-end gap-2 pt-2">
                                    <CustomButton
                                        title="ยกเลิก"
                                        variant="cancel"
                                        size="md"
                                        onPress={() => setOpenCreateAddon(false)}
                                    />
                                    <CustomButton
                                        title="สร้าง"
                                        variant="primary"
                                        size="md"
                                        onPress={handleCreateAddon}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                <div className="overflow-hidden rounded-xl shadow-md mt-4">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">ชื่อบริการ</th>
                                <th className="p-5 text-left">คำอธิบาย</th>
                                <th className="p-5 text-left">ราคา</th>
                                <th className="p-5 text-left">ประเภทบริการ</th>
                                <th className="p-5 text-left">รูปภาพ</th>
                                <th className="p-5 text-left">การจัดการ</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredAddon.map((item) => (
                                <tr key={item.addon_service_id}>
                                    <td className="p-4">{item.name}</td>
                                    <td className="p-4">{item.description}</td>
                                    <td className="p-4">{item.price}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold
                                                ${item.type === "ADDON" && "bg-red-300 text-rose-700"}
                                                ${item.type === "EXTRA" && "bg-blue-300 text-blue-700"}
                                            `}
                                        >
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {item.image_url ? (
                                            <img src={item.image_url} className="h-10 w-10 object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => openEditAddon(item)}
                                            className="text-yellow-400 text-xl hover:text-yellow-500 transition"
                                        >
                                            <FaEdit />
                                        </button>
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
            {editAddon && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h2 className="text-xl font-bold">แก้ไขบริการเสริม</h2>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">ชื่อบริการ</label>
                            <input className="w-full border rounded-lg p-2 text-sm" value={formAddon.name} onChange={(e) => setFormAddon({ ...formAddon, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">คำอธิบาย</label>
                            <textarea className="w-full border rounded-lg p-2 text-sm" value={formAddon.description} onChange={(e) => setFormAddon({ ...formAddon, description: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">ราคา</label>
                            <input type="number" className="w-full border rounded-lg p-2 text-sm" value={formAddon.price} onChange={(e) => setFormAddon({ ...formAddon, price: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">ประเภทบริการ</label>
                            <select className="w-full border rounded-lg p-2 text-sm" value={formAddon.type} onChange={(e) => setFormAddon({ ...formAddon, type: e.target.value })} >
                                <option value="ADDON">ADDON</option>
                                <option value="EXTRA">EXTRA</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">รูปภาพบริการ</label>
                            {editAddonImagePreview && (
                                <img src={editAddonImagePreview}
                                    className="h-24 w-24 object-cover rounded-lg border mb-2" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full border rounded-lg p-2 text-sm"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setEditAddonImageFile(file);
                                        setEditAddonImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <CustomButton
                                title="ยกเลิก"
                                variant="cancel"
                                size="md"
                                onPress={() => { setEditAddon(null); setEditAddonImageFile(null); setEditAddonImagePreview(""); }}
                            />
                            <CustomButton
                                title="บันทึก"
                                variant="primary"
                                size="md"
                                onPress={handleSaveAddon}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
export default Services;