import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaMapMarkerAlt, FaMap } from "react-icons/fa";
import { getBranches, createBranch, deleteBranch, updateBranch } from '../api/branchApi'
import type { Branch } from "../api/branchApi";
import { CustomButton } from "../components/Button";
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import SearchInput from "../components/SearchInput";
import "leaflet/dist/leaflet.css"
import { getMachinesByBranch, addMachineToBranch, deleteMachineFromBranch, getMachines } from '../api/branchmachineApi'
import type { BranchMachine } from '../api/branchmachineApi'

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
            click(e) {
                onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
            }
        })
        return null
    }

    return (
        <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            <MapContainer
                center={[13.7563, 100.5018]}
                zoom={11}
                style={{ height: 260, width: "100%" }}
                className="z-0"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ClickHandler />
                {value && <Marker position={[value.lat, value.lng]} />}
            </MapContainer>
            <div className="p-3 flex items-center gap-2 text-sm">
                {value ? (
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="font-medium">
                            Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}
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

// --- grouped type ---
type MachineGroup = {
    machine_id: string
    type: string
    capacity: number
    availableCount: number
    count: number
    ids: string[] // branch_machine_id ทั้งหมดของ group นี้
}

function Branche() {
    const [branches, setBranches] = useState<Branch[]>([])
    const [search, setSearch] = useState("")
    const [openModel, setOpenModal] = useState(false)
    const [editTarget, setEditTarget] = useState<Branch | null>(null)
    const [formData, setFormData] = useState({ branch_name: "" })
    const [pickedLatLng, setPickedLatLng] = useState<{ lat: number; lng: number } | null>(null)

    // --- เครื่องสาขา ---
    const [selectedBranchId, setSelectedBranchId] = useState<string>("")
    const [branchMachines, setBranchMachines] = useState<BranchMachine[]>([])
    const [allMachines, setAllMachines] = useState<BranchMachine[]>([])
    const [openMachineModal, setOpenMachineModal] = useState(false)
    const [machineForm, setMachineForm] = useState({ machine_id: "", quantity: 1 })

    const fetchBranches = async () => {
        const data = await getBranches()
        setBranches(data)
    }

    const fetchBranchMachines = async (branchId: string) => {
        if (!branchId) return
        const data = await getMachinesByBranch(branchId)
        setBranchMachines(data)
    }

    useEffect(() => {
        fetchBranches()
        getMachines().then(setAllMachines)
    }, [])

    useEffect(() => {
        fetchBranchMachines(selectedBranchId)
    }, [selectedBranchId])

    // --- group เครื่องตาม machine_id ---
    const groupedMachines: MachineGroup[] = Object.values(
        branchMachines.reduce((acc, bm) => {
            const key = bm.machine_id
            if (!acc[key]) {
                acc[key] = {
                    machine_id: bm.machine_id,
                    type: bm.machine?.type ?? "-",
                    capacity: bm.machine?.capacity ?? 0,
                    count: 0,
                    availableCount: 0,
                    ids: [],
                }
            }
            acc[key].count++
          if (bm.status === "AVAILABLE") acc[key].availableCount++
            acc[key].ids.push(bm.branch_machine_id)

            return acc
        }, {} as Record<string, MachineGroup>)
    )

    // ลบเครื่อง 1 ชิ้น (ลบ branch_machine_id แรกใน group)
    const handleDeleteMachine = async (group: MachineGroup) => {
        if (!confirm(`ลบเครื่อง ${group.type} ${group.capacity}kg 1 เครื่อง?`)) return
        const idToDelete = group.ids[0]
        await deleteMachineFromBranch(idToDelete)
        await fetchBranchMachines(selectedBranchId)
    }

    // เพิ่มเครื่อง
    const handleAddMachine = async () => {
        if (!selectedBranchId) return alert("กรุณาเลือกสาขา")
        if (!machineForm.machine_id) return alert("กรุณาเลือกประเภทเครื่อง")
        await addMachineToBranch(selectedBranchId, machineForm.machine_id, machineForm.quantity)
        await fetchBranchMachines(selectedBranchId)
        setOpenMachineModal(false)
        setMachineForm({ machine_id: "", quantity: 1 })
    }

    // --- branch modal ---
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
        await fetchBranches()
        setOpenModal(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("ลบสาขานี้?")) return
        await deleteBranch(id)
        setBranches(branches.filter(b => b.branch_id !== id))
        if (selectedBranchId === id) {
            setSelectedBranchId("")
            setBranchMachines([])
        }
    }

    const filtered = branches.filter(b =>
        b.branch_name.toLowerCase().includes(search.toLowerCase())
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

    const selectedBranchName = branches.find(b => b.branch_id === selectedBranchId)?.branch_name ?? ""

    return (
        <div className="p-8">
            <SearchInput value={search} onChange={setSearch} placeholder="ค้นหา..." />

            {/* Header สาขา */}
            <div className="mb-4 flex justify-between items-center">
                <label className="text-black text-3xl font-bold">สาขา</label>
                <CustomButton title="+ Add Branch" variant="primary" size="md" onPress={handleOpenAdd} />
            </div>

            {/* ตารางสาขา */}
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
                            <tr
                                key={branch.branch_id}
                                className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${selectedBranchId === branch.branch_id ? "bg-blue-50" : ""}`}
                                onClick={() => setSelectedBranchId(branch.branch_id)}
                            >
                                <td className="p-5">{branch.branch_name}</td>
                                <td className="p-5">{branch.lat_branch?.toFixed(4) ?? "-"}</td>
                                <td className="p-5">{branch.lng_branch?.toFixed(4) ?? "-"}</td>
                                <td className="p-5 flex gap-2" onClick={e => e.stopPropagation()}>
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

            {/* ส่วนเครื่องสาขา */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <label className="text-black text-3xl font-bold">เครื่องสาขา</label>
                        {selectedBranchName && (
                            <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                                {selectedBranchName}
                            </span>
                        )}
                    </div>
                    <CustomButton
                        title="+ เพิ่มเครื่องสาขา"
                        variant="primary"
                        size="md"
                        onPress={() => {
                            if (!selectedBranchId) return alert("กรุณาเลือกสาขาก่อน (คลิกที่แถวสาขา)")
                            setOpenMachineModal(true)
                        }}
                    />
                </div>

                {!selectedBranchId && (
                    <p className="text-gray-400 text-sm mb-3">คลิกที่สาขาด้านบนเพื่อดูเครื่องในสาขานั้น</p>
                )}

                <div className="overflow-hidden rounded-xl shadow-md">
                    <table className="w-full bg-white border-collapse">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="p-5 text-left">ประเภทเครื่อง</th>
                                <th className="p-5 text-left">ขนาด (กก.)</th>
                                <th className="p-5 text-left">จำนวนเครื่อง</th>
                                 <th className="p-5 text-left">ว่าง</th>
                                <th className="p-5 text-left">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedMachines.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-5 text-center text-gray-400">
                                        {selectedBranchId ? "ไม่มีเครื่องในสาขานี้" : "กรุณาเลือกสาขา"}
                                    </td>
                                </tr>
                            ) : (
                                groupedMachines.map((group) => (
                                    <tr key={group.machine_id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-5">{group.type}</td>
                                        <td className="p-5">{group.capacity} กก.</td>
                                        <td className="p-5">
                                            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
                                                {group.count} เครื่อง
                                            </span>
                                        </td>
                                        <td className="p-5">  {/* ✅ เพิ่ม */}
                                            <span className={`font-bold px-3 py-1 rounded-full text-sm ${group.availableCount === 0
                                                    ? "bg-red-100 text-red-600"
                                                    : group.availableCount === group.count
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                ว่าง {group.availableCount}/{group.count}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <button
                                                onClick={() => handleDeleteMachine(group)}
                                                className="text-red-500 text-xl hover:text-red-700 transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Branch */}
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
                            <button onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border text-sm">
                                ยกเลิก
                            </button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600">
                                {editTarget ? "แก้ไขสาขา" : "เพิ่มสาขา"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal เพิ่มเครื่อง */}
            {openMachineModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h2 className="text-xl font-bold">เพิ่มเครื่องให้สาขา — {selectedBranchName}</h2>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-500">ประเภทเครื่อง</label>
                            <select
                                className="w-full border rounded-lg p-2 text-sm"
                                value={machineForm.machine_id}
                                onChange={e => setMachineForm({ ...machineForm, machine_id: e.target.value })}
                            >
                                <option value="">-- เลือกเครื่อง --</option>
                                {allMachines.map((m: any) => (
                                    <option key={m.machine_id} value={m.machine_id}>
                                        {m.type} — {m.capacity} กก.
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
                                value={machineForm.quantity}
                                onChange={e => setMachineForm({ ...machineForm, quantity: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setOpenMachineModal(false)} className="px-4 py-2 rounded-lg border text-sm">
                                ยกเลิก
                            </button>
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