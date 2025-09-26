// api/reward.ts
// api/reward.ts
import axios from "axios";
import { type IReward } from "../types/rewards";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// -------- SUPERADMIN APIs --------

// Create reward
export const createReward = async (reward: Partial<IReward>) => {
  const { data } = await axios.post<IReward>(`${API_BASE_URL}/reward/create`, reward, {
    headers: getAuthHeaders(),
  });
  return data;
};

// Update reward
export const updateReward = async (id: string, reward: Partial<IReward>) => {
  const { data } = await axios.put<IReward>(`${API_BASE_URL}/reward/update/${id}`, reward, {
    headers: getAuthHeaders(),
  });
  return data;
};

// Delete reward
export const deleteReward = async (id: string) => {
  const { data } = await axios.delete(`${API_BASE_URL}/reward/delete/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

// Assign reward to user
export const assignRewardToUser = async (rewardId: string, userId: string) => {
  const { data } = await axios.post<IReward>(
    `${API_BASE_URL}/reward/assign/${rewardId}/${userId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return data;
};

// Get redeemed rewards by user
export const getRedeemedRewardsByUser = async (userId: string) => {
  const { data } = await axios.get<IReward[]>(
    `${API_BASE_URL}/reward/get/redeem/${userId}`,
    { headers: getAuthHeaders() }
  );
  return data;
};

// -------- USER APIs --------

// Get my active rewards
export const getMyRewards = async () => {
  const { data } = await axios.get<IReward[]>(`${API_BASE_URL}/reward/my`, {
    headers: getAuthHeaders(),
  });
  return data;
};

// Redeem a reward
export const redeemReward = async (rewardId: string) => {
  const { data } = await axios.post<IReward>(
    `${API_BASE_URL}/reward/redeem/${rewardId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return data;
};
