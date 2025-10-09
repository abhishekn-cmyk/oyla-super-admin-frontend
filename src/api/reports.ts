import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/delivery/reports";

export interface RevenueReport {
  totalRevenue: number;
  mealRevenue: Record<string, number>;
}

export interface DeliveryDelayReport {
  delayedOrders: any[];
  count: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // adjust key if needed
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchRevenueReport = async (): Promise<RevenueReport> => {
  const { data } = await axios.get(`${API_URL}/revenue`, {
    headers: getAuthHeader(),
  });
  return data;
};

export const fetchDeliveryDelayReport = async (): Promise<DeliveryDelayReport> => {
  const { data } = await axios.get(`${API_URL}/delivery-delays`, {
    headers: getAuthHeader(),
  });
  return data;
};
