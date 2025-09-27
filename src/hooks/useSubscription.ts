import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllStats,
  getSubscriptionStats,
} from "../api/subscription";
import type { ISubscription } from "../types/subscription";

// -------------------- Queries --------------------
export const useGetSubscriptions = () =>
  useQuery<ISubscription[], Error>(
    {
      queryKey: ["subscriptions"],
      queryFn: getSubscriptions,
      onError: (err: Error) => toast.error(err.message || "Failed to fetch subscriptions"),
    } as UseQueryOptions<ISubscription[], Error>
  );

// Fetch overall stats for all subscriptions
export const useGetAllStats = () =>
  useQuery({
    queryKey: ["subscriptionsStats"],
    queryFn: getAllStats,
   onError: (err: Error) => toast.error(err.message || "Failed to fetch subscriptions"),
    } as UseQueryOptions<ISubscription[], Error> ,
  );

// Fetch stats for a single subscription
export const useGetSubscriptionStats = (subscriptionId: string) =>
  useQuery({
    queryKey: ["subscriptionStats", subscriptionId],
    queryFn: () => getSubscriptionStats(subscriptionId),
    enabled: !!subscriptionId,
    onError: (err: Error) => toast.error(err.message || "Failed to fetch subscriptions"),
    } as UseQueryOptions<ISubscription[], Error>);

// -------------------- Mutations --------------------
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<ISubscription> }) =>
      createSubscription(userId, data),
    onSuccess: () => {
      toast.success("Subscription created successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create subscription"),
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, id, data }: { userId: string; id: string; data: Partial<ISubscription> }) =>
      updateSubscription(userId, id, data),
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update subscription"),
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, id }: { userId: string; id: string }) => deleteSubscription(userId, id),
    onSuccess: () => {
      toast.success("Subscription deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete subscription"),
  });
};
