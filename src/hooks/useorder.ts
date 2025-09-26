import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import type { IOrder, IOrderStats } from '../types/order';

const API_URL = import.meta.env.VITE_API_URL;

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// API functions
export const fetchOrders = async (): Promise<IOrder[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/order/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  
  return response.json();
};

export const fetchOrderStats = async (): Promise<IOrderStats> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/order/orders/stats/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch order stats');
  }
  
  return response.json();
};

export const toggleOrderStatus = async (orderId: string): Promise<IOrder> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/order/${orderId}/status/update`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
  
  return response.json();
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/order/order/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete order');
  }
};

// React Query hooks
export const useGetOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    refetchOnWindowFocus: false,
  });
};

export const useGetOrderStats = () => {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: fetchOrderStats,
    refetchOnWindowFocus: false,
  });
};

export const useToggleOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleOrderStatus,
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success('Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};