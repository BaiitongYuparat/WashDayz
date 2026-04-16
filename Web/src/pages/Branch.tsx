import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaMapMarkerAlt, FaMap } from "react-icons/fa";
import { getBranches, createBranch, deleteBranch, updateBranch } from '../api/branchApi'
import type { Branch } from "../api/branchApi";
import { CustomButton } from "../components/Button";
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import SearchInput from "../components/SearchInput";
import "leaflet/dist/leaflet.css"

//fix icon bug 
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

//
function MapPicker({ value, onChange }: {
    value: { lat: number; lng: number } | null
    onChange: (val: { lat: number; lng: number }) => void
}) {
    function ClickHandIer() {
        useMapEvents({
            click(e) {
                onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
            }
        })
        return null
    }

    return (
        <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            {/* Map */}
            <MapContainer
                center={[13.7563, 100.5018]}
                zoom={11}
                style={{ height: 260, width: "100%" }}
                className="z-0"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ClickHandIer />
                {value && <Marker position={[value.lat, value.lng]} />}
            </MapContainer>

            <div className="p-3 flex items-center gap-2 text-sm">
                {value ? (
                    <div className="flex items-center gap-2 ">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="font-medium">
                            Lat: {value.lat.toFixed(6)},  Lng: {value.lng.toFixed(6)}
                        </span>

                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                        <FaMap className="text-gray-400" />
                        <span>คลิกบนแผนที่เพื่อเลือกตำแหน่ง</span>
                    </div>
                )}

            </div>
        </div>
    )
}
function Branche() {

    const [branches, setBranches] = useState<Branch[]>([])
    const [search, setSearch] = useState("")
    const [openModel, setOpenModal] = useState(false)
    const [editTarget, setEditTarget] = useState<Branch | null>(null)

    const [formData, setFormData] = useState({ branch_name: "" })
    const [pickedLatLng, setPickedLatLng] = useState<{ lat: number; lng: number } | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const [data] = await Promise.all([
                getBranches(),
            ]);
            setBranches(data);
        };
        fetchData();
    })

    // บันทึก
    const handleSave = async () => {
        if (!formData.branch_name.trim()) return alert("กรุณากรอกชื่อสาขา")
        if (!pickedLatLng) return alert("กรุณาเลือกตำแหน่งบนแผนที่")

        if (editTarget) {
            await updateBranch(editTarget.branch_id, {
                branch_name: formData.branch_name,
                lat_branch: pickedLatLng.lat,
                lng_branch: pickedLatLng.lng,
            })
        } else {
            await createBranch({
                branch_name: formData.branch_name,
                lat_branch: pickedLatLng.lat,
                lng_branch: pickedLatLng.lng,
            })
        }

        await getBranches()
        setOpenModal(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("ลบสาขานี้?")) return
        await deleteBranch(id)
        setBranches(branches.filter(b => b.branch_id !== id))
    }


    const filtered = branches.filter(b =>
        b.branch_name.toLowerCase().includes(search.toLowerCase())
    )

    // เปิด modal เพิ่ม
    const handleOpenAdd = () => {
        setEditTarget(null)
        setFormData({ branch_name: "" })
        setPickedLatLng(null)
        setOpenModal(true)
    }

    // เปิด modal แก้ไข
    const handleOpenEdit = (branch: Branch) => {
        setEditTarget(branch)
        setFormData({ branch_name: branch.branch_name })
        setPickedLatLng(
            branch.lat_branch && branch.lng_branch
                ? { lat: branch.lat_branch, lng: branch.lng_branch }
                : null
        )
        setOpenModal(true)
    }


    return (
        <div className="p-8">
            {/* Search */}
            <SearchInput value={search} onChange={setSearch} placeholder="ค้นหา..." />
            {/* Header */}
            <div className="mb-4 flex justify-between items-center">
                <label className="text-black text-3xl font-bold">สาขา</label>
                <CustomButton title="+ Add Branch" variant="primary" size="md" onPress={handleOpenAdd} />
            </div>



            {/* Table */}
            <div className="overflow-hidden rounded-xl shadow-md">
                <table className="w-full bg-white border-collapse">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-5 text-left">ชื่อสาขา</th>
                            <th className="p-5 text-left">ลัดติจูด</th>
                            <th className="p-5 text-left">ลองติจูด</th>
                            <th className="p-5 text-left">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((branch) => (
                            <tr key={branch.branch_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-5">{branch.branch_name}</td>
                                <td className="p-5">{branch.lat_branch ?? "-"}</td>
                                <td className="p-5">{branch.lng_branch ?? "-"}</td>
                                <td className="p-5 flex gap-2">
                                    <button
                                        onClick={() => handleOpenEdit(branch)}
                                        className="text-yellow-400 text-xl hover:text-yellow-500 transition"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(branch.branch_id)}
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

            <div className="mt-4">
                <div className="flex justify-between items-center mb-6">
                    <label className="text-black text-3xl font-bold">เครื่องสาขา</label>
                    <CustomButton
                        title="+ เพิ่มเครื่องสาขา"
                        variant="primary"
                        size="md"
                        onPress={handleOpenAdd}
                    />
                </div>
                <div className="overflow-hidden rounded-xl shadow-md">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">ชื่อสาขา</th>
                                <th className="p-5 text-left">ขนาด (กก.)</th>
                                <th className="p-5 text-left">จำนวนเครื่อง</th>
                                <th className="p-5 text-left">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>

                </div>
                {/* Modal */}
                {openModel && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4">

                            <h2 className="text-xl font-bold">
                                {editTarget ? "Edit Branch" : "Add Branch"}
                            </h2>

                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">ชื่อสาขา</label>
                                <input
                                    className="w-full border rounded-lg p-2 text-sm"
                                    value={formData.branch_name}
                                    onChange={e => setFormData({ ...formData, branch_name: e.target.value })}
                                />
                            </div>

                            <MapPicker value={pickedLatLng} onChange={setPickedLatLng} />

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="px-4 py-2 rounded-lg border text-sm"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                                >
                                    {editTarget ? "แก้ไขสาขา" : "เพิ่มสาขา"}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Branche