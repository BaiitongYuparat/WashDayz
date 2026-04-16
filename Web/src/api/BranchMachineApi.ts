// services/branchMachine.service.ts
import axios from "axios";

const API_BRANCH_MACHINE = "http://localhost:8080/branch-machines";

export type BranchMachine = {
  branch_machine_id: string;
  branch_id: string;
  machine_id: string;
  status: string;
  machine?: {
    type: string;
    capacity: number;
    duration_minutes: number;
    price: number;
  };
};

export const getMachinesByBranch = async (branchId: string): Promise<BranchMachine[]> => {
  const res = await axios.get(`${API_BRANCH_MACHINE}/${branchId}`);
  return res.data;
};

export const addMachineToBranch = async (branch_id: string, machine_id: string,quantity: number = 1) => {
  const res = await axios.post(API_BRANCH_MACHINE, { branch_id, machine_id, quantity });
  return res.data;
};

export const deleteMachineFromBranch = async (branchMachineId: string) => {
  const res = await axios.delete(`${API_BRANCH_MACHINE}/${branchMachineId}`);
  return res.data;
};

export const getMachines = async (): Promise<BranchMachine[]> => {
  const res = await axios.get(`${API_BRANCH_MACHINE}/machines`)
  return res.data
}