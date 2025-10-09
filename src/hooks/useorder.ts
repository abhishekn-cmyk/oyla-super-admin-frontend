import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { IOrder, IOrderStats } from "../types/order";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthToken = () => localStorage.getItem("token");

// Fetch all daily orders
export const fetchOrders = async (): Promise<IOrder[]> => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/orders`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  
  // Transform the data to match IOrder interface
  return data.map((order: any) => ({
    ...order,
    // Ensure meals have proper structure
    meals: order.meals?.map((meal: any) => ({
      ...meal,
      productId: meal.productId || { _id: '', name: 'Unknown Product', costPrice: 0 },
      quantity: meal.quantity || 1
    })) || []
  }));
};

// Fetch order stats (with meals & subscriptions)
export const fetchOrderStats = async (): Promise<IOrderStats> => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/orders/stats/all`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch order stats");
  return res.json();
};

// Toggle order status
export const toggleOrderStatus = async (orderId: string): Promise<IOrder> => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/order/${orderId}/status/update`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
};

// Delete an order
export const deleteOrder = async (orderId: string): Promise<void> => {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/order/order/${orderId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete order");
};

// React Query hooks
export const useGetOrders = () => useQuery({ 
  queryKey: ["orders"], 
  queryFn: fetchOrders, 
  refetchOnWindowFocus: false 
});

export const useGetOrderStats = () => useQuery({ 
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
        headers: { 
          Authorization: `Bearer ${getAuthToken()}`, 
          "Content-Type": "application/json" 
        },
      }).then(res => {
        if (!res.ok) throw new Error("Failed to update order status");
        return res.json();
      }),
    onSuccess: (data, orderId) => {
      // Update order-stats cache
      queryClient.setQueryData(["order-stats"], (oldData: any) => {
        if (!oldData) return oldData;
        const updatedOrders = oldData.allOrders.map((order: IOrder) =>
          order._id === orderId
            ? { ...order, 
                meals: data.meals,
                status: data.orderStatus,
                paymentStatus: data.paymentStatus
              }
            : order
        );
        return { ...oldData, allOrders: updatedOrders };
      });

      // Update orders cache
      queryClient.setQueryData(["orders"], (oldOrders: IOrder[] | undefined) => {
        if (!oldOrders) return oldOrders;
        return oldOrders.map(order =>
          order._id === orderId
            ? { ...order, meals: data.meals, status: data.orderStatus, paymentStatus: data.paymentStatus }
            : order
        );
      });

      toast.success("Order status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });
};



export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};