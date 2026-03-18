import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // ✅ เอา /auth ออก
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export type Auth = {
  token: string;
  user: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
};


export const login = async (
  email: string,
  password: string
): Promise<Auth> => {
  const res = await api.post("/auth/login", { email, password }); // ✅ ถูกแล้ว
  return res.data;
};

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<Auth> => {
  const res = await api.post("/auth/register", {
    email,
    password,
    name,
  });

  return res.data;
};


export const getProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};