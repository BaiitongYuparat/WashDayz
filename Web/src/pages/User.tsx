import { useEffect, useState } from "react";
import { getUsers, deleteUser, createUser, putUser, createAddress, getAddress, updateAddress, deleteAddress, } from "../api/userApi";
import type { User as UserType, Address } from "../api/userApi";
import { FaTrash, FaEdit, FaMapMarkerAlt } from "react-icons/fa";
import { CustomButton } from "../components/Button"
import SearchInput from "../components/SearchInput";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";


function User() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [Data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });
  const [address, setAddress] = useState({
    label: "",
    receiver_name: "",
    district: "",
    subDistrict: "",
    province: "",
    postal_code: "",
    phone: "",
    houseNo: "",
  })
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState<Address | null>(null);


  type Role = "USER" | "ADMIN";
  const [editForm, setEditForm] = useState<{
    user_id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    password: string;
  } | null>(null);



  //delete id 
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await deleteUser(id);
    setUsers(users.filter((user) => user.user_id !== id));
  };

  // postข้อมูลใหม่
  const handleAddUser = async () => {
    await createUser(Data);

    const data = await getUsers(); // อัพเดตข้อมูลใหม่
    setUsers(data);

    setData({
      name: "",
      email: "",
      phone: "",
      role: "",
      password: ""
    });
  }
  const [openModal, setOpenModal] = useState(false);

  //ดึงข้อมูล
  useEffect(() => {

    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  //คัดกรองข้อมูลผู้ใช้
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())  //เช็คว่า name ของ user มีคำที่เราพิมพ์ค้นหาอยู่หรือไม่
  );

  const navigate = useNavigate();

  //ถ้ายังไม่ login ห้ามเข้า
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }

  }, []);

  //ไม่ใช่ ADMIN ห้ามเข้า
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
    }
  }, []);

  //ที่อยู่
  const handleAddAddress = async () => {
    if (!selectedUserId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!address.receiver_name || !address.district || !address.province || !address.postal_code) {
      alert("กรุณากรอกข้อมูลให้ครบ (ชื่อผู้รับ, อำเภอ, จังหวัด, รหัสไปรษณีย์)");
      return;
    }

    await createAddress({ ...address, user_id: selectedUserId }, token); // ส่ง token ไปด้วย

    const data = await getUsers();
    setUsers(data);

    setAddress({
      label: "",
      receiver_name: "",
      district: "",
      subDistrict: "",
      province: "",
      postal_code: "",
      phone: "",
      houseNo: "",
    });

    setOpenAddressModal(false);

  };


  //
  const handleEditUser = (user: UserType) => {
    setEditForm({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: (user.role as Role) ?? "USER",
    });
    setOpenEditModal(true);
  };

  //
  const handleSaveEdit = async () => {
    if (!editForm) return;
    await putUser(editForm.user_id, editForm);
    setUsers(await getUsers());
    setOpenEditModal(false);
    setEditForm(null);
  };

  //
  const handleSaveEditAddress = async () => {
    if (!editAddressForm?.address_id) return;
    const token = localStorage.getItem("token");
    console.log("token:", token);
    if (!token) return;

    await updateAddress(editAddressForm.address_id, editAddressForm, token);
    const data = await getUsers();
    setUsers(data);
    setEditAddressForm(null);
  };

  //
  const handleDeleteaddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    await deleteAddress(id, token);

    setUsers(users.map((user) => ({
      ...user,
      addresses: user.addresses?.filter((addr) => addr.address_id !== id),
    })));
  };


  return (
    <div className="p-8">

      <div className="mb-6 flex justify-between items-center">
        <label className="text-black text-3xl font-bold">
          User
        </label>

        <CustomButton
          title="+ Add User"
          variant="primary"
          size="md"
          onPress={() => setOpenModal(true)}


        />
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">

              <h2 className="text-xl font-bold">Add User</h2>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">Name</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={Data.name}
                  onChange={(e) => setData({ ...Data, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">Email</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={Data.email}
                  onChange={(e) => setData({ ...Data, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">Phone</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={Data.phone}
                  onChange={(e) => setData({ ...Data, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">Password</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={Data.password}
                  onChange={(e) => setData({ ...Data, password: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">Role</label>
                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={Data.role}
                  onChange={(e) => setData({ ...Data, role: e.target.value })}
                >
                  <option value="ADMIN" >ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await handleAddUser();
                    setOpenModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                  Add
                </button>
              </div>

            </div>
          </div>
        )}
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
              <th className="p-5 text-left">Name</th>
              <th className="p-5 text-left">Phone</th>
              <th className="p-5 text-left">Email</th>
              <th className="p-5 text-left">Address</th>
              <th className="p-5 text-left">Role</th>
              <th className="p-5 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-5">{user.name}</td>
                <td className="p-5">{user.phone}</td>
                <td className="p-5">{user.email}</td>
                <td className="p-5">
                  {user.addresses?.map((address) => (
                    <div key={address.address_id}>
                      {address.label} - {address.houseNo} {address.district}  {address.province} {address.postal_code}
                    </div>
                  ))}
                </td>
                <td className="p-5">
                  <select
                    value={user.role}
                    onChange={async (e) => {
                      await putUser(user.user_id, { ...user, role: e.target.value });
                      setUsers(await getUsers());
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                      ${user.role === "ADMIN" ? "bg-red-100 text-red-700 border-red-200" : "bg-blue-100 text-blue-700 border-blue-200"}
                      `}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                </td>

                <td className="p-5">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-yellow-400 text-xl hover:text-yellow-500 transition">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(user.user_id)}
                    className="text-red-500 text-xl hover:text-red-700 transition"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUserId(user.user_id);
                      setOpenAddressModal(true);
                    }}
                    className="text-gray-600 text-xl hover:text-gray-700 transition"
                  >
                    <FaMapMarkerAlt />

                  </button>


                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openAddressModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Add Address</h2>


            {users.find(u => u.user_id === selectedUserId)?.addresses?.map((addr) => (
              <div key={addr.address_id} className="text-sm text-gray-600 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt /> {addr.label} - {addr.houseNo} {addr.district} {addr.province} {addr.postal_code}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditAddressForm(addr)}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteaddress(addr.address_id!)}
                    className="text-red-500  hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}


            <div className="space-y-1">
              <label className="text-sm text-gray-500">Label</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="เช่น บ้าน, ที่ทำงาน"
                value={address.label}
                onChange={(e) => setAddress({ ...address, label: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">ชื่อผู้รับ</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={address.receiver_name}
                onChange={(e) => setAddress({ ...address, receiver_name: e.target.value })}
              />
            </div>

             <div className="space-y-1">
              <label className="text-sm text-gray-500">บ้านเลขที่</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={address.houseNo}
                onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-gray-500">อำเภอ</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={address.district}
                  onChange={(e) => setAddress({ ...address, district: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-500">ตำบล</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={address.subDistrict}
                  onChange={(e) => setAddress({ ...address, subDistrict: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-gray-500">จังหวัด</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={address.province}
                  onChange={(e) => setAddress({ ...address, province: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-500">รหัสไปรษณีย์</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={address.postal_code}
                  onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">เบอร์โทร</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOpenAddressModal(false)}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {openEditModal && editForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Edit User</h2>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">Name</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">Phone</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">Email</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">Password</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">Role</label>
              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setOpenEditModal(false); setEditForm(null); }}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editAddressForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Edit Address</h2>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">Label</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={editAddressForm.label}
                onChange={(e) => setEditAddressForm({ ...editAddressForm, label: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-500">ชื่อผู้รับ</label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                value={editAddressForm.receiver_name}
                onChange={(e) => setEditAddressForm({ ...editAddressForm, receiver_name: e.target.value })}
              />
            </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">บ้านเลขที่</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={editAddressForm.houseNo}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, houseNo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">อำเภอ</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={editAddressForm.district}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, district: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">ตำบล</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={editAddressForm.subDistrict ?? ""}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, subDistrict: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">จังหวัด</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={editAddressForm.province ?? ""}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, province: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">รหัสไปรษณีย์</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={editAddressForm.postal_code}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, postal_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-500">เบอร์โทร</label>
                <input
                  className="w-full border rounded-lg p-2 text-sm"
                  value={editAddressForm.phone ?? ""}
                  onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditAddressForm(null)}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditAddress}
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

      export default User;