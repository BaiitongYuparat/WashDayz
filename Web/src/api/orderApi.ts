import axios from "axios";

const API_URL = "http://localhost:8080/orders";

export type OrderItem = {
  quantity: number;
  subtotal: number;
  mainService?: {
    name: string;
  };
};

export type OrderStatus = "WAITING" | "PROCESSING" | "DONE";

export type Order = {
    order_id: string
    user_id: string
    rider_id: string
    branch_id: string
    service: string
    pieces: number
    price: number
    user: {
        name: string;
    };
    rider?: {
        name: string;
    };
   items: OrderItem[];
   status: string;
};


export const getOrders = async () => {
    const res = await axios.get(`${API_URL}`);
    return res.data;
};


export const getOrderById = async (id: string): Promise<Order> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};


export const createOrder = async (data: Omit<Order, "order_id">): Promise<Order> => {
    const res = await axios.post(API_URL, data);
    return res.data;
};


export const deleteOrder = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};


export const putOrder = async (id: string, data: { user_id: string, rider_id?: string, branch_id: string, service: string, pieces: number, price: number }): Promise<Order> => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
}