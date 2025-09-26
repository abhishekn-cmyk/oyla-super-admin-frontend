import axios from "axios";
import type { ISubscription } from "../types/subscription";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const instance = axios.create({
  baseURL: `${API_URL}/subscription`,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// GET all subscriptions
export const getSubscriptions = async (): Promise<ISubscription[]> => {
  const res = await instance.get("/");
  return res.data;
};

// CREATE subscription
export const createSubscription = async (userId: string, data: Partial<ISubscription>) => {
  const res = await instance.post(`/${userId}`, data);
  return res.data;
};

// UPDATE subscription
export const updateSubscription = async (userId: string, id: string, data: Partial<ISubscription>) => {
  const res = await instance.put(`/${userId}/${id}`, data);
  return res.data;
};

// DELETE subscription
export const deleteSubscription = async (userId: string, id: string) => {
  const res = await instance.delete(`/${userId}/${id}`);
  return res.data;
};

// --------------------------
// SUPERADMIN ONLY
// --------------------------

// GET overall stats for all subscriptions
export const getAllStats = async () => {
  const res = await instance.get("/subscription"); // matches router.get("/subscription")
  return res.data;
};

// GET stats for a single subscription
export const getSubscriptionStats = async (subscriptionId: string) => {
  const res = await instance.get(`/${subscriptionId}/stats`);
  return res.data;
};

