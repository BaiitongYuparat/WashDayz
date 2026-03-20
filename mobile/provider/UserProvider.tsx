import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { User } from "@/services/userService";

// กำหนด type ของ user (ปรับตาม structure จริงของ user)

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

// ใส่ default dummy function เพื่อให้ TypeScript ไม่ error
const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {}, // dummy function
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:8080/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.log("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

// custom hook ใช้งานง่าย ไม่ต้องเช็ค context
export const useUser = () => useContext(UserContext);