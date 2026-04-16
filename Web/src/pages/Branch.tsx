import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaMapMarkerAlt, FaMap, FaPlus } from "react-icons/fa";
import { getBranches, createBranch, deleteBranch, updateBranch } from '../api/branchApi'
import { getMachinesByBranch, addMachineToBranch, deleteMachineFromBranch, getMachines } from '../api/BranchMachineApi'
import type { BranchMachine } from '../api/BranchMachineApi'
import type { Branch } from "../api/branchApi";
import { CustomButton } from "../components/Button";
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import SearchInput from "../components/SearchInput";
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function MapPicker({ value, onChange }: {
    value: { lat: number; lng: number } | null
    onChange: (val: { lat: number; lng: number }) => void
}) {
    function ClickHandler() {
        useMapEvents({
            click(e) { onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) }
        })
        return null
    }
    return (
        <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            <MapContainer center={[13.7563, 100.5018]} zoom={11} style={{ height: 260, width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ClickHandler />
                {value && <Marker position={[value.lat, value.lng]} />}
            </MapContainer>
            <div className="p-3 flex items-center gap-2 text-sm">
                {value ? (
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="font-medium">Lat: {value.lat.toFixed(4)}, Lng: {value.lng.toFixed(4)}</span>
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

// type สำหรับ grouped data
type BranchMachineGroup = {
    branch: Branch
    machines: BranchMachine[]
}

function Branche() {
    const [branches, setBranches] = useState<Branch[]>([])
    const [search, setSearch] = useState("")
    const [openModal, setOpenModal] = useState(false)
    const [editTarget, setEditTarget] = useState<Branch | null>(null)
    const [formData, setFormData] = useState({ branch_name: "" })
    const [pickedLatLng, setPickedLatLng] = useState<{ lat: number; lng: number } | null>(null)

    // state สำหรับตารางเครื่องสาขา
    const [branchMachineGroups, setBranchMachineGroups] = useState<BranchMachineGroup[]>([])
    const [availableMachines, setAvailableMachines] = useState<BranchMachine[]>([])

    // modal เพิ่มเครื่อง
    const [openMachineModal, setOpenMachineModal] = useState(false)
    const [selectedBranchId, setSelectedBranchId] = useState("")
    const [selectedMachineId, setSelectedMachineId] = useState("")
    const [quantity, setQuantity] = useState(1)

    const fetchAll = async () => {
        const [branchData, machineData] = await Promise.all([
            getBranches(),
            getMachines(),
        ])
        setBranches(branchData)
        setAvailableMachines(machineData)

        // ดึงเครื่องของทุกสาขา
        const groups = await Promise.all(
            branchData.map(async (branch) => {
                const machines = await getMachinesByBranch(branch.branch_id)
                return { branch, machines }
            })
        )
        setBranchMachineGroups(groups)
    }

    useEffect(() => {
        fetchAll()
    }, []) // ใส่ [] เพื่อไม่ให้ loop

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
        await fetchAll()
        setOpenModal(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("ลบสาขานี้?")) return
        await deleteBranch(id)
        await fetchAll()
    }

    const handleDeleteMachine = async (branchMachineId: string) => {
        if (!confirm("ลบเครื่องนี้ออกจากสาขา?")) return
        await deleteMachineFromBranch(branchMachineId)
        await fetchAll()
    }

    const handleAddMachine = async () => {
        if (!selectedBranchId || !selectedMachineId) return alert("กรุณาเลือกสาขาและเครื่อง")
        await addMachineToBranch(selectedBranchId, selectedMachineId, quantity)
        setOpenMachineModal(false)
        setSelectedBranchId("")
        setSelectedMachineId("")
        setQuantity(1)
        await fetchAll()
    }

    const filtered = branches.filter(b =>
        b.branch_name.toLowerCase().includes(search.toLowerCase())
    )

    const filteredGroups = branchMachineGroups.filter(g =>
        g.branch.branch_name.toLowerCase().includes(search.toLowerCase())
    )

    const handleOpenAdd = () => {
        setEditTarget(null)
        setFormData({ branch_name: "" })
        setPickedLatLng(null)
        setOpenModal(true)
    }

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
        <div className="p-8 space-y-6">
            <SearchInput value={search} onChange={setSearch} placeholder="ค้นหา..." />

            {/* ตารางสาขา */}
            <div className="flex justify-between items-center">
                <label className="text-black text-3xl font-bold">สาขา</label>
                <CustomButton title="+ เพิ่มสาขา" variant="primary" size="md" onPress={handleOpenAdd} />
            </div>
            <div className="overflow-hidden rounded-xl shadow-md">
                <table className="w-full bg-white border-collapse">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-5 text-left">ชื่อสาขา</th>
                            <th className="p-5 text-left">ละติจูด</th>
                            <th className="p-5 text-left">ลองติจูด</th>
                            <th className="p-5 text-left">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((branch) => (
                            <tr key={branch.branch_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-5">{branch.branch_name}</td>
                                <td className="p-5">{branch.lat_branch?.toFixed(4) ?? "-"}</td>
                                <td className="p-5">{branch.lng_branch?.toFixed(4) ?? "-"}</td>
                                <td className="p-5 flex gap-2">
                                    <button onClick={() => handleOpenEdit(branch)} className="text-yellow-400 text-xl hover:text-yellow-500 transition">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(branch.branch_id)} className="text-red-500 text-xl hover:text-red-700 transition">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ตารางเครื่องสาขา */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-6">
                    <label className="text-black text-3xl font-bold">เครื่องสาขา</label>
                    <CustomButton
                        title="+ เพิ่มเครื่องสาขา"
                        variant="primary"
                        size="md"
                        onPress={() => setOpenMachineModal(true)}
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
                            {filteredGroups.map(({ branch, machines }) => {
                                // group เครื่องในสาขาเดียวกันตาม capacity
                                const capacityMap = new Map<number, BranchMachine[]>()
                                machines.forEach(m => {
                                    const cap = m.machine?.capacity ?? 0
                                    if (!capacityMap.has(cap)) capacityMap.set(cap, [])
                                    capacityMap.get(cap)!.push(m)
                                })

                                if (capacityMap.size === 0) return (
                                    <tr key={branch.branch_id} className="border-b border-gray-200">
                                        <td className="p-5">{branch.branch_name}</td>
                                        <td className="p-5 text-gray-400" colSpan={3}>ยังไม่มีเครื่อง</td>
                                    </tr>
                                )

                                return Array.from(capacityMap.entries()).map(([capacity, items], idx) => (
                                    <tr key={`${branch.branch_id}-${capacity}`} className="border-b border-gray-200 hover:bg-gray-50">
                                        {/* แสดงชื่อสาขาแค่แถวแรก */}
                                        {idx === 0 ? (
                                            <td className="p-5 font-medium" rowSpan={capacityMap.size}>
                                                {branch.branch_name}
                                            </td>
                                        ) : null}
                                        <td className="p-5">{capacity} กก.</td>
                                        <td className="p-5">{items.length} เครื่อง</td>
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-1">
                                                {items.map(item => (
                                                    <button
                                                        key={item.branch_machine_id}
                                                        onClick={() => handleDeleteMachine(item.branch_machine_id)}
                                                        className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition"
                                                        title={`ลบเครื่อง ${item.branch_machine_id.slice(0, 8)}...`}
                                                    >
                                                        <FaTrash className="text-xs" />
                                                        <span>ลบ 1 เครื่อง</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal เพิ่มสาขา / แก้ไขสาขา */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4">
                        <h2 className="text-xl font-bold">{editTarget ? "แก้ไขสาขา" : "เพิ่มสาขา"}</h2>
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
                            <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border text-sm">ยกเลิก</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600">
                                {editTarget ? "แก้ไขสาขา" : "เพิ่มสาขา"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal เพิ่มเครื่องสาขา */}
            {openMachineModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h2 className="text-xl font-bold">เพิ่มเครื่องให้สาขา</h2>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">เลือกสาขา</label>
                            <select
                                className="w-full border rounded-lg p-2 text-sm"
                                value={selectedBranchId}
                                onChange={e => setSelectedBranchId(e.target.value)}
                            >
                                <option value="">-- เลือกสาขา --</option>
                                {branches.map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">เลือกเครื่อง</label>
                            <select
                                className="w-full border rounded-lg p-2 text-sm"
                                value={selectedMachineId}
                                onChange={e => setSelectedMachineId(e.target.value)}
                            >
                                <option value="">-- เลือกเครื่อง --</option>
                                {availableMachines.map(m => (
                                    <option key={m.machine_id} value={m.machine_id}>
                                        {m.machine?.capacity ?? "?"} กก. — {m.machine?.type ?? "unknown"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">จำนวนเครื่อง</label>
                            <input
                                type="number"
                                min={1}
                                className="w-full border rounded-lg p-2 text-sm"
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setOpenMachineModal(false)} className="px-4 py-2 rounded-lg border text-sm">ยกเลิก</button>
                            <button onClick={handleAddMachine} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600">
                                เพิ่มเครื่อง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Branche