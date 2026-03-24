import axios from "axios";

const API_URL = "http://localhost:8080/addresses";

export type UserAddress = {
  user_id: string;
  label: string;
  houseNo: string;
  receiver_name:string;
  district:string;
  subDistrict:string;
  province: string;
  postal_code:string;
  details: string;
  lat: number;
  lng: number;
  phone: string;
};

export type UserAddresses = {
  address_id: string;
  user_id: string;
  label: string;
  houseNo: string;
  receiver_name:string;
  district:string;
  subDistrict:string;
  province: string;
  postal_code:string;
  details: string;
  lat: number;
  lng: number;
  phone: string;
};

export const createAddress = async(data:UserAddress,token:string) => {
    const res = await axios.post(API_URL , data , {
  headers: {
    Authorization: `Bearer ${token}`,
  }, })
    return res.data;
}

export const getAddress = async(token:string): Promise<UserAddresses[]> => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
}