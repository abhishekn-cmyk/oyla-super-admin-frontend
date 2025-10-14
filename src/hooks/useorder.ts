import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { IOrder, IOrderStats } from "../types/order";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const getAuthToken = () => localStorage.getItem("token");

// -------------------------
// Fetch all daily orders
// -------------------------
export const fetchOrders = async (): Promise<IOrder[]> => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/orders`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch orders");

  const data = await res.json();
  console.log("fetchOrders raw response:", data);

  // Transform the data to match IOrder interface
  const transformedData = data.map((order: any) => ({
    ...order,
    meals: order.meals?.map((meal: any) => ({
      ...meal,
      productId: meal.productId || { _id: '', name: 'Unknown Product', costPrice: 0, price: 0 },
      quantity: meal.quantity || 1
    })) || [],
    subscriptionId: order.subscriptionId || null
  }));

  console.log("fetchOrders transformed:", transformedData);

  return transformedData;
};

// -------------------------
// Fetch order stats
// -------------------------
export const fetchOrderStats = async (): Promise<IOrderStats> => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/orders/stats/all`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch order stats");

  const data = await res.json();
  console.log("fetchOrderStats full response:", data);

  // Optional: log each order's meals and subscription
  data.allOrders?.forEach((order: any) => {
    console.log(`Order ${order._id} subscription:`, order.subscriptionId);
    console.log(`Order ${order._id} meals:`, order.meals);
  });

  return data;
};

// -------------------------
// Toggle order status
// -------------------------
export const toggleOrderStatus = async (orderId: string): Promise<IOrder> => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/order/${orderId}/status/update`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to update order status");

  const data = await res.json();
  console.log(`toggleOrderStatus response for ${orderId}:`, data);

  return data;
};

// -------------------------
// Update order status using axios
// -------------------------
export const useUpdateOrderStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.patch(`${API_URL}/order/order/${orderId}/status`, { status });
      console.log(`useUpdateOrderStatus response for ${orderId}:`, res.data);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || "Something went wrong");
      console.error(`useUpdateOrderStatus error for ${orderId}:`, err);
      throw err;
    }
  };

  return { updateStatus, loading, error };
};

// -------------------------
// Update payment status using axios
// -------------------------
export const useUpdatePaymentStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePayment = async (orderId: string, paymentStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.patch(`${API_URL}/order/order/${orderId}/payment`, { paymentStatus });
      console.log(`useUpdatePaymentStatus response for ${orderId}:`, res.data);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || "Something went wrong");
      console.error(`useUpdatePaymentStatus error for ${orderId}:`, err);
      throw err;
    }
  };

  return { updatePayment, loading, error };
};

// -------------------------
// Delete an order
// -------------------------
const deleteOrder = async (orderId: string) => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/order/${orderId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete order");

  const data = await res.json();
  console.log(`deleteOrder response for ${orderId}:`, data);
  return data;
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: (data) => {
      console.log("useDeleteOrder success:", data);
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
    },
    onError: (error: Error) => {
      console.error("useDeleteOrder error:", error);
      toast.error(error.message);
    },
  });
};

// -------------------------
// React Query hooks
// -------------------------
export const useGetOrders = () =>
  useQuery({ 
    queryKey: ["orders"], 
    queryFn: fetchOrders, 
    refetchOnWindowFocus: false 
  });

export const useGetOrderStats = () =>
  useQuery({ 
    queryKey: ["order-stats"], 
    queryFn: fetchOrderStats, 
    refetchOnWindowFocus: false 
  });

export const useToggleOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      fetch(`${API_URL}/order/order/${orderId}/status/update`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getAuthToken()}`, "Content-Type": "application/json" },
      }).then(res => {
        if (!res.ok) throw new Error("Failed to update order status");
        return res.json();
      }),
    onSuccess: (data, orderId) => {
      console.log("useToggleOrderStatus onSuccess data:", data);

      // Update orders cache
      queryClient.setQueryData(["orders"], (oldOrders: IOrder[] | undefined) => {
        if (!oldOrders) return oldOrders;
        return oldOrders.map(order =>
          order._id === orderId
            ? { ...order, meals: data.meals, status: data.orderStatus, paymentStatus: data.paymentStatus }
            : order
        );
      });

      // Update order-stats cache
      queryClient.setQueryData(["order-stats"], (oldData: any) => {
        if (!oldData) return oldData;
        const updatedOrders = oldData.allOrders.map((order: IOrder) =>
          order._id === orderId
            ? { ...order, meals: data.meals, status: data.orderStatus, paymentStatus: data.paymentStatus }
            : order
        );
        return { ...oldData, allOrders: updatedOrders };
      });

      toast.success("Order status updated successfully");
    },
    onError: (err) => {
      console.error("useToggleOrderStatus onError:", err);
      toast.error("Failed to update order status");
    },
  });
};
