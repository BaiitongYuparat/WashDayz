import axios from "axios";
const API_URL = "http://172.20.10.2:8080/machines";

export interface Machine {
  machine_id: string;
  type: string;
  capacity: number;
  duration_minutes: number;
  price: number;
  isDefault?: boolean; 
}

export const getMachines = async (): Promise<Machine[]> => {
  const res = await axios.get<Machine[]>(API_URL);
  return res.data;
};

export const getMachinesByIds = async (ids: string[]): Promise<Machine[]> => {
  const res = await axios.get<Machine[]>(`${API_URL}/by-ids`, {
    params: { ids: ids.join(",") }
  });
  return res.data;
}
export const getMachinesByMainService = async (
  main_service_id: string
): Promise<Machine[]> => {
  const res = await axios.get<Machine[]>(
    `http://172.20.10.2:8080/main-machine/by-main-service/${main_service_id}`
  );
  return res.data;
};