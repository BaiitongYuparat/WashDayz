import { useEffect, useState } from "react";
import { getUsers, deleteUser, putUser } from "../api/userApi";
import type { User as UserType } from "../api/userApi";
import { FaTrash, FaEdit } from "react-icons/fa";

function User() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");


  //delete id 
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?" )) return;
    await deleteUser(id);
    setUsers(users.filter((user) => user.user_id !== id));
  };

  // const handlePut = async (id: number) => {
  //   const name = prompt("Enter new name");
  //   const email = prompt("Enter new email");
  //   if (!name || !email) return;
  //   await putUser(id, { name, email });
  //   const data = await getUsers();  // โหลดข้อมูลใหม่
  //   setUsers(data);
  // };

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  //คัดกรองข้อมูลผู้ใช้
  const filteredUsers = users.filter((user) =>
    user.user_id === Number(search) ||
    user.name.toLowerCase().includes(search.toLowerCase()) || //เช็คว่า name ของ user มีคำที่เราพิมพ์ค้นหาอยู่หรือไม่
    user.email.toLowerCase().includes(search.toLowerCase()) || //เช็คว่า email ของ user มีคำที่เราพิมพ์ค้นหาอยู่หรือไม่
    user.phone.includes(search) //เช็คว่าเบอร์โทรของ userมีตัวเลขที่ค้นหาหรือไม่
  );


  return (
   <div className="p-8">

  <div className="mb-6">
    <label className="text-black text-3xl font-bold">
      User
    </label>
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
          <th className="p-5 text-left">User ID</th>
          <th className="p-5 text-left">Name</th>
          <th className="p-5 text-left">Phone</th>
          <th className="p-5 text-left">Email</th>
          <th className="p-5 text-left">Address</th>
          <th className="p-5 text-left">Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredUsers.map((user) => (
          <tr key={user.user_id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="p-5">WDZ-{String(user.user_id).padStart(3, "0")}</td>
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

            <td className="p-5">
              <button
                onClick={() => handleDelete(user.user_id)}
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

export default User;