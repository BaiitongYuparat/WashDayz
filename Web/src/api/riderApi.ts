import axios from "axios";

const API_URL = "http://localhost:8080/riders";

export type Rider = {
    rider_id: string;
    name: string;
    phone: string;
    license_plate: string;
};

export const getRider = async () => {
    const res = await axios.get(`${API_URL}`);
    return res.data;
};

export const getRiderById = async (id: string): Promise<Rider> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}

export const putRiderById = async (id: string, data: { name: string; phone: string; license_plate: string }): Promise<Rider> => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
}

export const createRider = async (data: Rider): Promise<Rider> => {
    const res = await axios.put(API_URL, data);
    return res.data;
}

export const deleteRider = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};
