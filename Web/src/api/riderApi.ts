import axios from "axios";

const API_URL = "http://localhost:8080/riders";

export type Rider = {
  rider_id: number;
  name: string;
  phone: string;
  license_plate: string;
};

export const getRider = async () => {
    const res = await axios.get(`${API_URL}`);
    return res.data;
};

export const deleteRider = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};