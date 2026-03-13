import axios from "axios";

const API_URL = "http://localhost:8080/users";

export type User = {
    user_id: number
    name: string
    email: string
    password: string
    phone: string
    addresses?: Address[]
};

export type Address = {
  address_id?: number
  label: string
  receiver_name: string
  district: string
  postal_code: string
}

export const getUsers = async () => {
    const res = await axios.get(`${API_URL}`);
    return res.data;
};

export const getUsersById = async (id: number): Promise<User> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createUser = async (data: User): Promise<User> => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const putUser = async (id: number, data: { name: string; email: string }) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};
