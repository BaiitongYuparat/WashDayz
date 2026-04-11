import axios from "axios";

const API_URL = "http://localhost:8080/users";
const ADDRESS_URL = "http://localhost:8080/addresses";

export type User = {
    user_id: string
    name: string
    email: string
    phone: string
    addresses?: Address[]
    password: string
    role: string
};

export type Address = {
  address_id?: string;
   user_id?: string;  
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
  role?: string; 
  password: string
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
export const createAddress = async(data:Address,token:string) => {
    const res = await axios.post(ADDRESS_URL, data , {
  headers: {
    Authorization: `Bearer ${token}`,
  }, })
    return res.data;
}

export const getAddress = async(token:string): Promise<Address[]> => {
  const res = await axios.get(ADDRESS_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
}

export const updateAddress = async(id: string,data:Address,token:string ): Promise<Address> => {
  const res = await axios.put(`${ADDRESS_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
}

export const deleteAddress = async(id: string,token:string ): Promise<Address> => {
  const res = await axios.put(`${ADDRESS_URL}/${id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
}