import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"

const API_URL = "http://172.20.10.2:8080/queues"

export type Queue = {
  queue_id: string
  order_id: string
  branch_id: string
  queue_number: number
  machine_type: string | null
  branch_machine_id: string | null
  finished_at: string | null
  created_at: string
}

const getToken = async () => {
  const token = await AsyncStorage.getItem("token")
  if (!token) throw new Error("No token")
  return token
}

// สร้างคิว — backend จะสร้างทีละ machine_type อัตโนมัติ
export const createQueue = async (
  order_id: string,
  branch_id: string
): Promise<Queue[]> => {
  const token = await getToken()

  const res = await axios.post(
    `${API_URL}`,
    { order_id, branch_id },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return res.data.data
}

// ดึงคิวตาม order_id
export const getQueueByOrderId = async (
  order_id: string
): Promise<Queue[]> => {
  const token = await getToken()

  const res = await axios.get(`${API_URL}/order/${order_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return res.data
}