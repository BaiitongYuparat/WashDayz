import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = "http://172.20.10.2:8080"

export type Payment = {
  payment_id: string
  order_id: string
  payment_method: string
  status: "PENDING" | "PAID" | "FAILED"
  paid_at: string | null
  created_at: string
}

const getToken = async () => {
  const token = await AsyncStorage.getItem("token")
  if (!token) throw new Error("No token")
  return token
}

export const createPayment = async (
  order_id: string,
  payment_method: string
): Promise<Payment> => {
  const token = await getToken()
  const res = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order_id, payment_method }),
  })
  const data = await res.json() 
  if (!res.ok) throw new Error(data?.error ?? "สร้าง payment ไม่สำเร็จ")
  return data
}

export const confirmPayment = async (payment_id: string): Promise<Payment> => {
  const token = await getToken()
  const res = await fetch(`${API_URL}/payments/${payment_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "PAID",
      paid_at: new Date().toISOString(),
    }),
  })
  const data = await res.json() 
  if (!res.ok) throw new Error(data?.error ?? "ยืนยันการชำระเงินไม่สำเร็จ")
  return data
}