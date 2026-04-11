const API_URL = "http://172.20.10.2:8080"

export type BranchScore = {
  branch_id: string
  branch_name: string
  travelMinutes: number
  waitMinutes: number
  totalExpectedMinutes: number
  machineAvailable: boolean
}

export type RecommendResult = {
  recommendedBranchId: string
  recommendedBranchName: string
  totalExpectedMinutes: number
  waitMinutes: number
  travelMinutes: number
  machineAvailable: boolean
  reasoning: string
  allBranchesScored: BranchScore[]
}

export type RecommendInput = {
  userLat: number
  userLng: number
  machineType?: string
  capacity?: number
  mainServiceId?: string
}

export type Branch = {
  branch_id: string
  branch_name: string
  address?: string
}


export const recommendBranch = async (
  input: RecommendInput,
  token: string
): Promise<RecommendResult> => {
  const res = await fetch(`${API_URL}/recommend-branch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  const data = await res.json()
  console.log("recommend status:", res.status)
  console.log("recommend response:", JSON.stringify(data, null, 2))

  if (!res.ok) throw new Error("โหลดข้อมูลสาขาไม่สำเร็จ")
  return data
}

export const getBranchById = async (id: string): Promise<Branch> => {
  const res = await fetch(`${API_URL}/branches/${id}`)
  if (!res.ok) throw new Error("โหลดข้อมูลสาขาไม่สำเร็จ")
  return res.json()
}