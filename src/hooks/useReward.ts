// hooks/reward.ts
import { useQuery, useMutation, useQueryClient,type UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import {toast} from "react-toastify";
import type { IReward } from "../types/rewards";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------- API FUNCTIONS ----------
export const getAllRewards = async (): Promise<IReward[]> => {
  const { data } = await axios.get<IReward[]>(`${API_BASE_URL}/reward/all`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const createReward = async (reward: Partial<IReward>) => {
  const { data } = await axios.post<IReward>(`${API_BASE_URL}/reward/create`, reward, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const updateReward = async (id: string, reward: Partial<IReward>) => {
  const { data } = await axios.put<IReward>(`${API_BASE_URL}/reward/update/${id}`, reward, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const deleteReward = async (id: string) => {
  const { data } = await axios.delete(`${API_BASE_URL}/reward/delete/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

// ---------- REACT QUERY HOOKS WITH TOAST ----------
export const useGetAllRewards = () => {
  const options: UseQueryOptions<IReward[], Error> = {
    queryKey: ["rewards"],
    queryFn: getAllRewards,
    // onError: (err: Error) => {
    //   toast.error(`Failed to fetch rewards: ${err.message}`);
    // },
  };

  return useQuery(options);
};
export const useCreateReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reward: Partial<IReward>) => createReward(reward),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward created successfully!");
    },
    onError: (err: any) => toast.error(`Failed to create reward: ${err.message}`),
  });
};

export const useUpdateReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reward }: { id: string; reward: Partial<IReward> }) =>
      updateReward(id, reward),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward updated successfully!");
    },
    onError: (err: any) => toast.error(`Failed to update reward: ${err.message}`),
  });
};

export const useDeleteReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReward(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward deleted successfully!");
    },
    onError: (err: any) => toast.error(`Failed to delete reward: ${err.message}`),
  });
};
