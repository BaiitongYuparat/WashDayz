import axios from "axios";
const API_URL = "http://172.20.10.2:8080/services/addons";

export interface AddonType {
  addon_service_id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  img ?: string;
}

export const getAddonByMainServiceId = async (main_service_id:string): Promise<AddonType[]> => {
  const res = await axios.get<AddonType[]>(API_URL, {
    params: {main_service_id}
  });
  return res.data;
};

export const getAddonByIds = async (ids: string[]): Promise<AddonType[]> => {
  const results = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`${API_URL}/addonservice/${id}`)
      if (!res.ok) throw new Error(`โหลด addon ${id} ไม่สำเร็จ`)
      return res.json()
    })
  )
  return results
}