import axios from "axios";

const API_BRANCH = "http://localhost:8080/branches";
export interface Branch {
    branch_id: string
    branch_name: string
    lat_branch: number | null
    lng_branch: number | null
}

export const getBranches = async () => {
    const res = await axios.get(`${API_BRANCH}`);
    return res.data;
}

export const getBranchesById = async (id: string): Promise<Branch[]> => {
    const res = await axios.get(`${API_BRANCH}/${id}`);
    return res.data;
}

export const createBranch = async (data: { branch_name: string, lng_branch: number, lat_branch: number }) => {
    const res = await axios.post(`${API_BRANCH}`, data);
    return res.data;
}

export const deleteBranch = async (id: string) => {
    const res = await axios.delete(`${API_BRANCH}/${id}`);
    return res.data;
}

export const updateBranch = async (id: string, data: { branch_name: string, lat_branch: number, lng_branch: number }) => {
    const res = await axios.put(`${API_BRANCH}/${id}`, data);
    return res.data;
}