import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as api from "../api/deliverypartner";
import type { IDeliveryPartner, IDelivery, IStats } from "../types/deliverypartner";

// ======================= Queries =======================

// Fetch all partners
export const usePartners = () =>
  useQuery<IDeliveryPartner[], Error>(
    {
      queryKey: ["partners"],
      queryFn: () => api.fetchPartners(),
      onError: (err: Error) => toast.error(err?.message || "Failed to fetch partners"),
    } as UseQueryOptions<IDeliveryPartner[], Error>
  );

// Fetch single partner
export const usePartner = (id: string) =>
  useQuery<IDeliveryPartner, Error>(
    {
      queryKey: ["partner", id],
      queryFn: () => api.fetchPartnerById(id),
      enabled: !!id,
      onError: (err: Error) => toast.error(err?.message || "Failed to fetch partner"),
    } as UseQueryOptions<IDeliveryPartner, Error>
  );

// Fetch all deliveries
export const useDeliveries = () =>
  useQuery<IDelivery[], Error>(
    {
      queryKey: ["deliveries"],
      queryFn: () => api.fetchDeliveries(),
      onError: (err: Error) => toast.error(err?.message || "Failed to fetch deliveries"),
    } as UseQueryOptions<IDelivery[], Error>
  );

// Fetch orders assigned to a partner
export const usePartnerOrders = (driverId: string) =>
  useQuery<IDelivery[], Error>(
    {
      queryKey: ["partnerOrders", driverId],
      queryFn: () => api.fetchPartnerOrders(driverId),
      enabled: !!driverId,
      onError: (err: Error) => toast.error(err?.message || "Failed to fetch partner orders"),
    } as UseQueryOptions<IDelivery[], Error>
  );

// Fetch driver-specific stats
export const useDriverStats = (driverId: string) =>
  useQuery<any, Error>(
    {
      queryKey: ["driverStats", driverId],
      queryFn: () => api.fetchDriverStats(driverId),
      enabled: !!driverId,
      onError: (err: Error) => toast.error(err?.message || "Failed to fetch driver stats"),
    } as UseQueryOptions<any, Error>
  );

// Fetch overall system stats
export const useOverallStats = () =>
  useQuery<IStats, Error>(
    {
      queryKey: ["overallStats"],
      queryFn: () => api.fetchOverallStats(),
      onError: (err: Error) => toast.error(err?.message || "Failed to fetch overall stats"),
    } as UseQueryOptions<IStats, Error>
  );

// ======================= Mutations =======================
const useQueryClientWithToast = () => {
  const qc = useQueryClient();
  return qc;
};

// Create partner
export const useCreatePartner = () => {
  const qc = useQueryClientWithToast();
  return useMutation({
    mutationFn: (data: Partial<IDeliveryPartner>) => api.createPartner(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner created successfully");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create partner"),
  });
};

// Update partner
export const useUpdatePartner = () => {
  const qc = useQueryClientWithToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IDeliveryPartner> }) => api.updatePartner(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["partner", vars.id] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner updated successfully");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update partner"),
  });
};

// Delete partner
export const useDeletePartner = () => {
  const qc = useQueryClientWithToast();
  return useMutation({
    mutationFn: (id: string) => api.deletePartner(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner deleted successfully");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete partner"),
  });
};

// Assign order to partner
export const useAssignOrder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orderId: string; driverId: string; userId: string }) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/driver/deliveries/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Order assigned successfully");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to assign order"),
  });
};

// Update order/delivery status
export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: string; status: string }) =>
      fetch(`${import.meta.env.VITE_API_URL}/driver/deliveries/${deliveryId}/update-order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((res) => res.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["partnerOrders"] });
      toast.success("Order status updated");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update order status"),
  });
};

