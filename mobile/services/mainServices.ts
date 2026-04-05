import axios from "axios";
const API_URL = "http://172.20.10.2:8080/mainservices";

export type MainService  = {
    main_service_id: string;
    name: string;
    description?: string;
}


export const getMainServices = async (): Promise<MainService[]> => {
  const res = await axios.get<MainService[]>(API_URL);
  return res.data;
};

export const getMainServicesById = async (id:string): Promise<MainService> => {
  const res = await axios.get<MainService>(`${API_URL}/${id}`);
  return res.data;
};