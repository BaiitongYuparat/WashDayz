import axios from "axios";
const API_URL = "http://172.20.10.2:8080/machines";

export interface Machine {
  id: string;
  type: string;
  time: string;
  isDefault?: boolean; // backend ส่งว่าเลือกไว้ก่อนหรือไม่
}

export const getMachines = async (): Promise<Machine[]> => {
  const res = await axios.get<Machine[]>(API_URL);
  return res.data;
};

