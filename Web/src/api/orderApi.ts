import axios from "axios";

const API_URL = "http://localhost:8080/orders";

export type OrderItem = {
  order_item_id: string;
  quantity: number;
  subtotal: number;
  machine_id?: string;
  machine?: {
    machine_id: string;
    type: string;
    capacity: number;
    price?: number;
  };
  mainService?: {
    name: string;
  };
  orderItemAddons?: {
    addon_service_id: string;
    addonService?: {
      name: string;
      price: number;
    };
  }[];
};

export type OrderStatus = "WAITING" | "PROCESSING" | "DONE";

export type Order = {
  order_id: string;
  user_id: string;
  branch_id: string;
  address_id?: string;
  total_price?: number;   
  status: string;
  created_at?: string;
  user: { name: string };
  branch?: { branch_name: string };
  items: OrderItem[];
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


export const putOrder = async (id: string, data: {  user_id: string,  branch_id: string, total_price?: number, status: string }): Promise<Order> => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
}

export const putOrderStatus = async (id: string, data: { status: string }): Promise<Order> => {
    const res = await axios.put(`${API_URL}/${id}/status`, data);
    return res.data;
};