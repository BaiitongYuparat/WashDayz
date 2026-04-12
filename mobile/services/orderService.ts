import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = "http://172.20.10.2:8080"

export type OrderDetail = {
  order_id: string
  status: string
  total_price: number
  created_at: string
  branch: {
    branch_id: string
    branch_name: string
  }
  address?: {
    address_id: string
    label: string
    details: string
  }
  items: {
    order_item_id: string
    machine: {
      machine_id: string
      type: string
      capacity: number
      duration_minutes: number
      price: number
    }
    orderItemAddons: {
      id: string
      addonService: {
        addon_service_id: string
        name: string
        price: number
      }
    }[]
  }[]
}

export type CreateOrderPayload = {
  branch_id: string
  address_id?: string
  machine_id: string[]
  addon_id: string[]
}

const getToken = async () => {
  const token = await AsyncStorage.getItem("token")
  if (!token) throw new Error("No token")
  return token
}

export const createOrder = async (
  userId: string,
  payload: CreateOrderPayload
): Promise<{ order_id: string }> => {
  const token = await getToken()
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      branch_id: payload.branch_id,
      address_id: payload.address_id,
      machine_id: payload.machine_id, 
      addon_id: payload.addon_id,     
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error("สร้าง order ไม่สำเร็จ")
  return data
}

export const getOrderById = async (orderId: string): Promise<OrderDetail> => {
  const token = await getToken()
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()  // ← อ่านครั้งเดียวตรงนี้
  if (!res.ok) throw new Error(data?.error ?? "โหลด order ไม่สำเร็จ")
  return data
}

export const getOrdersByUser = async (userId: string): Promise<OrderDetail[]> => {
  const token = await getToken()
  const res = await fetch(`${API_URL}/orders/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error("โหลดประวัติไม่สำเร็จ")
  return data
}

export const putOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const token = await getToken()
  const res = await fetch(`${API_URL}/orders/status/${orderId}`, // ← แก้ตรงนี้
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  )
  if (!res.ok) throw new Error("อัพเดทสถานะไม่สำเร็จ")
}