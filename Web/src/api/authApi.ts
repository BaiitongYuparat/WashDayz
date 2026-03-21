import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
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


export const login = async ( email: string, password: string ): Promise<Auth> => {
  const res = await api.post("/auth/login", { email, password }); 
  return res.data;
};
