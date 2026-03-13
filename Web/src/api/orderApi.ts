import axios from "axios";

const API_URL = "http://localhost:8080/orders";

export type Order = {
    order_id: number
    user_id: number
    rider_id: number
    branch_id: number
    service: string
    pieces: number
    price: number
};


export const getOrders = async () => {
    const res = await axios.get(`${API_URL}`);
    return res.data;
};


export const getOrderById = async (id: number): Promise<Order> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};


export const createOrder = async (data: Omit<Order, "order_id">): Promise<Order> => {
    const res = await axios.post(API_URL, data);
    return res.data;
};


export const deleteOrder = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};


export const putOrder = async (id: number, data: { user_id: number, rider_id?: number, branch_id: number, service: string, pieces: number, price: number }): Promise<Order> => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
}