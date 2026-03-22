import axios from "axios";

const API_URL = "http://localhost:8080/users";
const ADDRESS_URL = "http://localhost:8080/addresses";

export type User = {
    user_id: string
    name: string
    email: string
    password: string
    phone: string
    addresses?: Address[]
    role: string
};

export type Address = {
  address_id?: string;
  label: string;
  receiver_name: string;
  district: string;
  subDistrict?: string;
  province?: string;
  postal_code: string;
  phone?: string;
};


export type CreateUser = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string; 
};

export const getUsers = async () => {
    const res = await axios.get(`${API_URL}`);
    return res.data;
    
};

export const getUsersById = async (id: string): Promise<User> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createUser = async (data: CreateUser): Promise<User> => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const putUser = async (id: string, data: User) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

//ทั้อยู่
export const createAddress = async (data: any) => {
  const res = await axios.post(ADDRESS_URL, data);
  return res.data;
};


export const updateAddress = async (id: string, data: any) => {
  const res = await axios.put(`${ADDRESS_URL}/${id}`, data);
  return res.data;
};


export const deleteAddress = async (id: string) => {
  const res = await axios.delete(`${ADDRESS_URL}/${id}`);
  return res.data;
};

export const getAddress = async () => {
    const res = await axios.get(`${ADDRESS_URL}`);
    return res.data;
    
};