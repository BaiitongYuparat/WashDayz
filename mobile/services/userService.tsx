import axios from "axios";
import { UserAddresses } from "./address";

const API_URL = "http://172.20.10.2:8080/auth";

export type Address = {
  address_id: string;
  user_id: string;
  label: string;
  receiver_name: string;
  district: string;
  subDistrict: string;
  province: string;
  postal_code: string;
  details: string | null;
  lat: number | null;
  lng: number | null;
  phone: string;
};

export type User = {
  user_id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  addresses: UserAddresses[];
};


export const createUser = async (data: User) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updateUser = async(id: string,data:User,token:string ): Promise<User> => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
}
