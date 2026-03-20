import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export type User = {
  user_id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
};


export const createUser = async (data: User) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};
