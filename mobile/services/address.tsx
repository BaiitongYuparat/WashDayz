import axios from "axios";

const API_URL = "http://localhost:8080/addresses";

export type UserAddress = {
  user_id: string;
  label: string;
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