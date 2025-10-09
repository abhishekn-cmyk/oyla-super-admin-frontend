import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllStats,
  getSubscriptionStats,
  getSubscriptionById,
  getUserSubscriptions,
  subscriptionAPI,
  settingsAPI,
  systemAPI,
  type AllStatsResponse,
  type SubscriptionStatsResponse,
  type SubscriptionActionResponse,
  type CreateSubscriptionData,changewindow
  // type CheckoutSubscriptionData,
} from "../api/subscription";
import type { ISubscription } from "../types/subscription";

// -------------------- Queries --------------------
export const useGetSubscriptions = () => {
  return useQuery<ISubscription[], Error>({
    queryKey: ["subscriptions"],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      try {
        return await getSubscriptions();
      } catch (err: any) {
        toast.error(err?.message || "Failed to fetch subscriptions");
        throw err;
      }
    },
  });
};
export const useChangeWindow = () => {
  return useMutation({
    mutationFn: changewindow,
    onSuccess: (data) => {
      toast.success(data.message || "Change window executed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to execute change window");
    },
  });
};

export const useGetUserSubscriptions = (userId?: string) => {
  return useQuery<ISubscription[], Error>({
    queryKey: ["userSubscriptions", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      try {
        return await getUserSubscriptions(userId);
      } catch (err: any) {
        toast.error(err?.message || "Failed to fetch user subscriptions");
        throw err;
      }
    },
  });
};

export const useGetSubscription = (subscriptionId?: string) => {
  return useQuery<ISubscription, Error>({
    queryKey: ["subscription", subscriptionId],
    enabled: !!subscriptionId,
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      if (!subscriptionId) throw new Error("Subscription ID is required");
      try {
        return await getSubscriptionById(subscriptionId);
      } catch (err: any) {
        toast.error(err?.message || "Failed to fetch subscription");
        throw err;
      }
    },
  });
};

export const useGetAllStats = () => {
  return useQuery<AllStatsResponse, Error>({
    queryKey: ["subscriptionsStats"],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      try {
        return await getAllStats();
      } catch (err: any) {
        toast.error(err?.message || "Failed to fetch stats");
        throw err;
      }
    },
  });
};

export const useGetSubscriptionStats = (subscriptionId?: string) => {
  return useQuery<SubscriptionStatsResponse, Error>({
    queryKey: ["subscriptionStats", subscriptionId],
    enabled: !!subscriptionId,
    queryFn: async () => {
      if (!subscriptionId) throw new Error("Subscription ID is required");
      try {
        return await getSubscriptionStats(subscriptionId);
      } catch (err: any) {
        toast.error(err?.message || "Failed to fetch subscription stats");
        throw err;
      }
    },
  });
};

// -------------------- Mutations --------------------
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<ISubscription, Error, { userId: string; data: CreateSubscriptionData }>({
    mutationFn: async ({ userId, data }) => createSubscription(userId, data),
    onSuccess: () => {
      toast.success("Subscription created successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create subscription"),
  });
};

// export const useCheckoutSubscription = () => {
//   const queryClient = useQueryClient();
//   return useMutation<ISubscription, Error, { userId: string; data: CheckoutSubscriptionData }>({
//     mutationFn: async ({ userId, data }) => subscriptionAPI.checkout(userId, data),
//     onSuccess: () => {
//       toast.success("Subscription checkout completed successfully!");
//       queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
//       queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
//     },
//     onError: (err: Error) => toast.error(err.message || "Failed to checkout subscription"),
//   });
// };

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<ISubscription, Error, { userId: string; id: string; data: Partial<ISubscription> }>({
    mutationFn: async ({ userId, id, data }) => updateSubscription(userId, id, data),
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update subscription"),
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: string; id: string }>({
    mutationFn: async ({ userId, id }) => deleteSubscription(userId, id),
    onSuccess: () => {
      toast.success("Subscription deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete subscription"),
  });
};

export const usePaySubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionActionResponse, Error, { subscriptionId: string; amount: number; userId: string }>({
    mutationFn: async ({ subscriptionId, amount, userId }) => subscriptionAPI.pay(subscriptionId, amount, userId),
    onSuccess: (data) => {
      toast.success(data?.message || "Payment processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to process payment"),
  });
};

// -------------------- Subscription Actions --------------------
export const useSubscriptionActions = () => {
  const queryClient = useQueryClient();

 const pauseSubscription = useMutation<SubscriptionActionResponse, Error, string>({
    mutationFn: async (subscriptionId: string) => {
      try {
        const response = await subscriptionAPI.pause(subscriptionId);
        console.log('Pause API response:', response);
        return response;
      } catch (err: any) {
        console.error('Pause API error:', err);
        throw new Error(err?.response?.data?.message || err.message || "Failed to pause subscription");
      }
    },
    onSuccess: (data) => {
      console.log('Pause mutation success:', data);
      toast.success(data?.message || "Subscription paused successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
    },
    onError: (err: Error) => {
      console.error('Pause mutation error:', err);
      toast.error(err.message || "Failed to pause subscription");
    },
  });

  const resumeSubscription = useMutation<SubscriptionActionResponse, Error, string>({
    mutationFn: async (subscriptionId: string) => {
      try {
        const response = await subscriptionAPI.resume(subscriptionId);
        console.log('Resume API response:', response);
        return response;
      } catch (err: any) {
        console.error('Resume API error:', err);
        throw new Error(err?.response?.data?.message || err.message || "Failed to resume subscription");
      }
    },
    onSuccess: (data) => {
      console.log('Resume mutation success:', data);
      toast.success(data?.message || "Subscription resumed successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
    },
    onError: (err: Error) => {
      console.error('Resume mutation error:', err);
      toast.error(err.message || "Failed to resume subscription");
    },
  });

  const cancelSubscription = useMutation<SubscriptionActionResponse, Error, { subscriptionId: string; userId: string }>({
    mutationFn: async ({ subscriptionId, userId }) => {
      try {
        // Try the simple cancel first, fallback to user-specific cancel
        const response = await subscriptionAPI.cancel(subscriptionId);
        console.log('Cancel API response:', response);
        return response;
      } catch (err: any) {
        console.error('Cancel API error:', err);
        // If simple cancel fails, try the user-specific cancel
        try {
          const response = await subscriptionAPI.cancelSubscription(userId, subscriptionId);
          return response;
        } catch (fallbackErr: any) {
          throw new Error(fallbackErr?.response?.data?.message || fallbackErr.message || "Failed to cancel subscription");
        }
      }
    },
    onSuccess: (data) => {
      console.log('Cancel mutation success:', data);
      toast.success(data?.message || "Subscription cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
    },
    onError: (err: Error) => {
      console.error('Cancel mutation error:', err);
      toast.error(err.message || "Failed to cancel subscription");
    },
  });

  const swapMeal = useMutation<SubscriptionActionResponse, Error, { subscriptionId: string; date: string; slot: string }>({
    mutationFn: async ({ subscriptionId, date, slot }) => subscriptionAPI.swapMeal(subscriptionId, { date, slot }),
    onSuccess: (data) => {
      toast.success(data?.message || "Meal swapped successfully");
      queryClient.invalidateQueries({queryKey:["subscriptions"]});
    },
    onError: (err: Error) => toast.error(err.message || "Failed to swap meal"),
  });

  return { pauseSubscription, resumeSubscription, cancelSubscription, swapMeal };
};

// -------------------- Settings --------------------
export const useSettings = (category?: string) => {
  return useQuery({
    queryKey: ["settings", category],
    queryFn: async () => {
      try {
        return await settingsAPI.getSettings(category);
      } catch (err: any) {
        toast.error(err?.message || "Failed to fetch settings");
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpsertSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => settingsAPI.upsertSetting(data),
    onSuccess: () => {
      toast.success("Setting saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save setting"),
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => settingsAPI.deleteSetting(key),
    onSuccess: () => {
      toast.success("Setting deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete setting"),
  });
};

// -------------------- System --------------------
export const useLockMeals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => systemAPI.lockMeals(),
    onSuccess: () => {
      toast.success("Meals locked successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to lock meals"),
  });
};

export const useAutoRenew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => systemAPI.autoRenew(),
    onSuccess: () => {
      toast.success("Auto-renew executed successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to execute auto-renew"),
  });
};

// -------------------- Export --------------------
export default {
  useGetSubscriptions,
  useGetUserSubscriptions,
  useGetSubscription,
  useGetAllStats,
  useGetSubscriptionStats,
  useCreateSubscription,
  // useCheckoutSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  usePaySubscription,
  useSubscriptionActions,
  useSettings,
  useUpsertSetting,
  useDeleteSetting,
  useLockMeals,
  useAutoRenew,
};
