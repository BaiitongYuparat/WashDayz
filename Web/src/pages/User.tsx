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
    password: "",
  });
  const [address, setAddress] = useState({
    label: "",
    receiver_name: "",
    district: "",
    subDistrict: "",
    province: "",
    postal_code: "",
    phone: "",
  })
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);




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
      password: "",
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
    user.name.toLowerCase().includes(search.toLowerCase()) || //เช็คว่า name ของ user มีคำที่เราพิมพ์ค้นหาอยู่หรือไม่
    user.email.toLowerCase().includes(search.toLowerCase()) || //เช็คว่า email ของ user มีคำที่เราพิมพ์ค้นหาอยู่หรือไม่
    user.phone.includes(search) //เช็คว่าเบอร์โทรของ userมีตัวเลขที่ค้นหาหรือไม่
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
  const handleAddAddress = async (userId: string) => {
    await createAddress({
      ...address,
      user_id: userId,
    });
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

            <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
              <h2 className="text-xl font-bold mb-4">Add User</h2>
              <input
                className="w-full border p-2 mb-3 rounded"
                placeholder="Name"
                value={Data.name}
                onChange={(e) => setData({ ...Data, name: e.target.value })}
              />

              <input
                className="w-full border p-2 mb-3 rounded"
                placeholder="Email"
                value={Data.email}
                onChange={(e) => setData({ ...Data, email: e.target.value })}
              />

              <input
                className="w-full border p-2 mb-3 rounded"
                placeholder="Phone"
                value={Data.phone}
                onChange={(e) => setData({ ...Data, phone: e.target.value })}
              />

              <input
                type="password"
                className="w-full border p-2 mb-4 rounded"
                placeholder="Password"
                value={Data.password}
                onChange={(e) => setData({ ...Data, password: e.target.value })}
              />

              <div className="flex justify-end gap-2">
                <CustomButton
                  title="Cancel"
                  variant="danger"
                  onPress={() => setOpenModal(false)}
                />

                <CustomButton
                  title="Add"
                  variant="success"
                  onPress={async () => {
                    await handleAddUser();
                    setOpenModal(false);
                  }}
                />
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
              <th className="p-5 text-left">User ID</th>
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
                <td className="p-5">{user.user_id}</td>
                <td className="p-5">{user.name}</td>
                <td className="p-5">{user.phone}</td>
                <td className="p-5">{user.email}</td>
                <td className="p-5">
                  {user.addresses?.map((address) => (
                    <div key={address.address_id}>
                      {address.label} - {address.district} {address.postal_code}
                    </div>
                  ))}
                </td>
                <td className="p-5">{user.role}</td>

                <td className="p-5">
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

    </div>
  );
}

export default User;