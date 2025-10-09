import  type { IDeliveryPartner, IDelivery, IStats } from "../types/deliverypartner";

const API_URL = import.meta.env.VITE_API_URL + "/driver";

export const fetchPartners = async (): Promise<IDeliveryPartner[]> => {
  const res = await fetch(`${API_URL}/partners`);
  return res.json();
};

export const fetchPartnerById = async (id: string): Promise<IDeliveryPartner> => {
  const res = await fetch(`${API_URL}/partners/${id}`);
  return res.json();
};

export const createPartner = async (data: Partial<IDeliveryPartner>) => {
  const res = await fetch(`${API_URL}/create/delivery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updatePartner = async (id: string, data: Partial<IDeliveryPartner>) => {
  const res = await fetch(`${API_URL}/partners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deletePartner = async (id: string) => {
  const res = await fetch(`${API_URL}/partners/${id}`, { method: "DELETE" });
  return res.json();
};

export const fetchDeliveries = async (): Promise<IDelivery[]> => {
  const res = await fetch(`${API_URL}/deliveries`);
  return res.json();
};

export const fetchPartnerOrders = async (driverId: string) => {
 const res = await fetch(`${import.meta.env.VITE_API_URL}/driver/${driverId}/orders`);
  return res.json();
};

export const fetchDriverStats = async (driverId: string) => {
  const res = await fetch(`${API_URL}/stats/drivers/${driverId}`);
  return res.json();
};

export const fetchOverallStats = async (): Promise<IStats> => {
  const res = await fetch(`${API_URL}/stats/overview`);
  return res.json();
};

// Update delivery/order status
export const updateOrderStatusApi = async (data: { deliveryId: string; status: string }) => {
  const res = await fetch(`${API_URL}/deliveries/${data.deliveryId}/update-order`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: data.status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
