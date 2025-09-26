import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllStats,
  getSubscriptionStats,
} from "../api/subscription";
import type { ISubscription } from "../types/subscription";

// ✅ Fetch all subscriptions
export const useGetSubscriptions = () => {
  return useQuery<ISubscription[], Error>({
    queryKey: ["subscriptions"],
    queryFn: getSubscriptions,
  });
};

// ✅ Create subscription
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<ISubscription> }) =>
      createSubscription(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
};

// ✅ Update subscription
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, id, data }: { userId: string; id: string; data: Partial<ISubscription> }) =>
      updateSubscription(userId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
};

// ✅ Delete subscription
export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, id }: { userId: string; id: string }) => deleteSubscription(userId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
};

// ==========================
// SUPERADMIN HOOKS
// ==========================

// ✅ Fetch overall stats for all subscriptions
export const useGetAllStats = () => {
  return useQuery({
    queryKey: ["subscriptionsStats"],
    queryFn: getAllStats,
  });
};

// ✅ Fetch stats for a single subscription
export const useGetSubscriptionStats = (subscriptionId: string) => {
  return useQuery({
    queryKey: ["subscriptionStats", subscriptionId],
    queryFn: () => getSubscriptionStats(subscriptionId),
    enabled: !!subscriptionId, // only fetch if subscriptionId is provided
  });
};
