import axios from "axios";

const API_URL = "http://localhost:3000";

export type User = {
    user_id: String
    name: String
    email: String
    password: String
    phone: String
};

export const getUsers = async () => {
    const res = await axios.get(`${API_URL}`);
    return res.data;
};

export const getUsersById = async (id: string): Promise<User> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createUser = async (data: User): Promise<User> => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};