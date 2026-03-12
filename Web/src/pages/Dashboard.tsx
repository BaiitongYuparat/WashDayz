import { useEffect, useState } from "react";
import { getUsers } from "../api/userApi";

function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      console.log(data);
      setUsers(data);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User List</h1>

      {users.map((user) => (
        <div key={user.user_id}>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Dashboard;