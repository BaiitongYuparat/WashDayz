import { useEffect, useState } from "react";
import { getUsers } from "../api/userApi";

function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  return (
    <div>
    </div>
  );
}

export default Dashboard;