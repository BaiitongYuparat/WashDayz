import axios from "axios";

const API_URL = "http://localhost:8080/payments";

export type Payment = {
  payment_id: string;
  order_id: string;
  payment_method: string;
  status: string;
  created_at?: string;
  paid_at?: string | null;
  updated_at?: string;
  order?: {
    total_price?: number;
    status?: string;
    user?: { name: string };
    branch?: { branch_name: string };
    items?: {
      machine_id?: string;
      machine?: {
        machine_id: string;
        type: "WASHER" | "DRYER";
        capacity: number;
        price?: number;
        duration_minutes?: number;
      };
    }[];
  };
};

export const getPayments = async (): Promise<Payment[]> => {
  const res = await axios.get(API_URL);
  return res.data.data; 
};

export const deletePayment = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const putPayment = async (id: string, data: { status: string }): Promise<Payment> => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};