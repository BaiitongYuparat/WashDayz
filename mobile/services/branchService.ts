import axios from "axios"

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
  machineTypes?: {
    type: string
    capacity: number
  }[]
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
  const res = await axios.post(
    `${API_URL}/recommend-branch`,
    input,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getBranchById = async (
  id: string
): Promise<Branch> => {
  const res = await axios.get(`${API_URL}/branches/${id}`);
  return res.data;
};

export const getAllBranches = async (): Promise<Branch[]> => {
  const res = await axios.get(`${API_URL}/branches`);
  return res.data;
};