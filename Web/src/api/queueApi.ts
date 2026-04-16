import axios from "axios"

const API_URL = "http://localhost:8080/queues"

// Type
export type Queue = {
    queue_id: string
    queue_number: number
    order_id: string
    order_name?: string
    branch_id: string
    branch_name?: string
    machine_type: "WASHER" | "DRYER" | null
    created_at: string
    called_at: string | null
    finished_at: string | null
    branch_machine_id: string | null
    
}
// สร้างคิว
export const createQueue = async (order_id: string, branch_id: string) => {
    const res = await axios.post(API_URL, { order_id, branch_id })
    return res.data
}

// ดูคิวทั้งหมด 
export const getQueues = async (branch_id?: string) => {
    const res = await axios.get(API_URL, {
        params: branch_id ? { branch_id } : {}
    })
    return res.data as Queue[]
}

// ดูคิวตาม ID
export const getQueueById = async (queue_id: string) => {
    const res = await axios.get(`${API_URL}/${queue_id}`)
    return res.data as Queue
}

// ลบคิว
export const deleteQueue = async (queue_id: string) => {
    const res = await axios.delete(`${API_URL}/${queue_id}`)
    return res.data
}

// ปิดคิว
export const finishQueue = async (queue_id: string) => {
    const res = await axios.patch(`${API_URL}/${queue_id}/finish`)
    return res.data as Queue
}

// รีเซ็ตคิว
export const resetQueue = async (queue_id: string) => {
    const res = await axios.patch(`${API_URL}/${queue_id}/reset`)
    return res.data as Queue
}

