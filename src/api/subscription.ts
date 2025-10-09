import instance from "./axios";
import type { ISubscription } from "../types/subscription";

// -------------------- Types --------------------
export interface AllStatsResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  subscription: ISubscription[];
}

export interface SubscriptionStatsResponse {
  subscription: ISubscription;
  totalMeals: number;
  dailyOrdersCount: number;
}

export interface SubscriptionActionResponse {
  success: boolean;
  message: string;
}

export interface CreateSubscriptionData {
  durationDays: number;
  mealsPerDay: number;
  startDate: string;
  planType?: string;
  planName?: string;
  price?: number;
  meals?: Array<{
    date: string;
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  }>;
}

export interface CheckoutSubscriptionData {
  planDuration: number;
  startDate: string;
  mealSelections: Array<{
    date: string;
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  }>;
  planType?: string;
  paymentMethod?: string;
  paymentMethodId?: string;
}

// -------------------- API Calls --------------------

// Get all subscriptions (admin/superadmin)
export const getSubscriptions = async (): Promise<ISubscription[]> => {
  const res = await instance.get("/subscription");
  return res.data?.subscriptions ?? [];
};

// Get all stats (superadmin)
export const getAllStats = async (): Promise<AllStatsResponse> => {
  const res = await instance.get("/subscription/subscription/stats");
  return {
    totalSubscriptions: res.data?.stats?.totalSubscriptions ?? 0,
    activeSubscriptions: res.data?.stats?.activeSubscriptions ?? 0,
    subscription: res.data?.stats?.subscription ?? [],
  };
};

// Get subscription payments
export const getSubscriptionPayments = async (subscriptionId: string): Promise<any> => {
  const res = await instance.post('/subscription/subscriptions/payments', { subscriptionId });
  return res.data;
};

// Get stats for a single subscription (superadmin)
export const getSubscriptionStats = async (
  subscriptionId: string
): Promise<SubscriptionStatsResponse> => {
  const res = await instance.get(`/subscription/id/${subscriptionId}/stats`);
  return {
    subscription: res.data?.subscription ?? ({} as ISubscription),
    totalMeals: res.data?.stats?.totalMeals ?? 0,
    dailyOrdersCount: res.data?.stats?.dailyOrdersCount ?? 0,
  };
};

// Get subscription by ID
export const getSubscriptionById = async (subscriptionId: string): Promise<ISubscription> => {
  const res = await instance.get(`/subscription/id/${subscriptionId}`);
  return res.data?.subscription ?? ({} as ISubscription);
};

// Get user subscriptions
export const getUserSubscriptions = async (userId: string): Promise<ISubscription[]> => {
  const res = await instance.get(`/subscription/user/${userId}`);
  return res.data?.subscriptions ?? [];
};
interface ChangeWindowResponse {
  success: boolean;
  message: string;
  lockedCount?: number; // optional if backend returns how many meals got locked
}

export const changewindow = async (): Promise<ChangeWindowResponse> => {
  try {
    const res = await instance.post<ChangeWindowResponse>("/subscription/lock-meals");
    return res.data;
  } catch (error: any) {
    console.error("Error triggering change window:", error);

    // handle axios or network error safely
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Failed to trigger change window");
    }
    throw new Error("Network or server error while triggering change window");
  }
};
// Create subscription as admin/superadmin
export const createSubscription = async (
  userId: string,
  data: CreateSubscriptionData
): Promise<ISubscription> => {
  const res = await instance.post(`/subscription/user/${userId}`, data);
  return res.data?.subscription ?? ({} as ISubscription);
};

// User checkout subscription with meal selection
export const checkoutSubscription = async (
  userId: string,
  data: CheckoutSubscriptionData
): Promise<ISubscription> => {
  const res = await instance.post(`/subscription/user/${userId}/checkout`, data);
  return res.data?.subscription ?? ({} as ISubscription);
};

// Update subscription (admin/superadmin)
export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  data: Partial<ISubscription>
): Promise<ISubscription> => {
  const res = await instance.put(`/subscription/user/${userId}/${subscriptionId}`, data);
  return res.data?.subscription ?? ({} as ISubscription);
};

// Delete subscription (admin/superadmin)
export const deleteSubscription = async (
  userId: string,
  subscriptionId: string
): Promise<void> => {
  await instance.delete(`/subscription/user/${userId}/${subscriptionId}`);
};

// Create subscription with direct payment
export const createSubscriptionWithPayment = async (data: any): Promise<any> => {
  const res = await instance.post("/subscription/create", data);
  return res.data;
};

// Process refund
export const processRefund = async (data: {
  subscriptionId: string;
  reason: string;
}): Promise<any> => {
  const res = await instance.post("/subscription/refund", data);
  return res.data;
};

// Toggle subscription status (pause/resume)
export const toggleSubscriptionStatus = async (
  subscriptionId: string,
  action: string
): Promise<any> => {
  const res = await instance.patch(`/subscription/id/${subscriptionId}/toggle-status`, { action });
  return res.data;
};

// Pay subscription amount
export const paySubscriptionAmount = async (
  subscriptionId: string,
  amount: number,
  userId: string
): Promise<any> => {
  const res = await instance.post(`/subscription/id/${subscriptionId}/paid`, { amount, userId });
  return res.data;
};

// -------------------- Subscription Actions --------------------
// -------------------- Subscription Actions --------------------
export const subscriptionAPI = {
  // Pause subscription
  pause: async (subscriptionId: string): Promise<SubscriptionActionResponse> => {
    const res = await instance.post(`/subscription/id/${subscriptionId}/pause`);
    return res.data;
  },

  // Resume subscription
  resume: async (subscriptionId: string): Promise<SubscriptionActionResponse> => {
    const res = await instance.post(`/subscription/id/${subscriptionId}/resume`);
    return res.data;
  },

  // Cancel subscription - FIXED: Use the correct endpoint that matches your API
  cancel: async (subscriptionId: string): Promise<SubscriptionActionResponse> => {
    // Use the toggleStatus endpoint or create a dedicated cancel endpoint
    const res = await instance.patch(`/subscription/id/${subscriptionId}/toggle-status`, { 
      action: 'cancel' 
    });
    return res.data;
  },

  // Alternative cancel method if you have a specific cancel endpoint
  cancelSubscription: async (userId: string, subscriptionId: string): Promise<SubscriptionActionResponse> => {
    const res = await instance.patch(`/subscription/user/${userId}/cancel/${subscriptionId}`);
    return res.data;
  },

  // Deliver meal
  deliverMeal: async (subscriptionId: string): Promise<SubscriptionActionResponse> => {
    const res = await instance.post(`/subscription/id/${subscriptionId}/deliver`);
    return res.data;
  },

  // Freeze subscription
  freeze: async (subscriptionId: string): Promise<SubscriptionActionResponse> => {
    const res = await instance.post(`/subscription/id/${subscriptionId}/freeze`);
    return res.data;
  },

  // Swap meal
  swapMeal: async (subscriptionId: string, data: { date: string; slot: string }): Promise<SubscriptionActionResponse> => {
    const res = await instance.post(`/subscription/id/${subscriptionId}/swap`, data);
    return res.data;
  },

  // Pay subscription
  pay: async (subscriptionId: string, amount: number, userId: string): Promise<SubscriptionActionResponse> => {
    const res = await instance.post(`/subscription/id/${subscriptionId}/paid`, { amount, userId });
    return res.data;
  },
};

// -------------------- Settings API --------------------
export const settingsAPI = {
  // Get all settings
  getSettings: async (category?: string): Promise<any> => {
    const params = category ? { category } : {};
    const res = await instance.get("/subscription/settings", { params });
    return res.data;
  },

  // Upsert setting
  upsertSetting: async (data: {
    key: string;
    value: any;
    description?: string;
    category?: string;
  }): Promise<any> => {
    const res = await instance.post("/subscription/settings", data);
    return res.data;
  },

  // Delete setting
  deleteSetting: async (key: string): Promise<any> => {
    const res = await instance.delete(`/subscription/settings/${key}`);
    return res.data;
  },
};

// -------------------- System Operations --------------------
export const systemAPI = {
  // Lock meals
  lockMeals: async (): Promise<any> => {
    const res = await instance.post("/subscription/lock-meals");
    return res.data;
  },

  // Auto renew subscriptions
  autoRenew: async (): Promise<any> => {
    const res = await instance.post("/subscription/auto-renew");
    return res.data;
  },
};

export default {
  getSubscriptions,
  getAllStats,
  getSubscriptionStats,
  getSubscriptionById,
  getUserSubscriptions,
  createSubscription,
  checkoutSubscription,
  updateSubscription,
  deleteSubscription,
  createSubscriptionWithPayment,
  processRefund,
  toggleSubscriptionStatus,
  paySubscriptionAmount,
  getSubscriptionPayments,
  subscriptionAPI,
  settingsAPI,
  systemAPI,
};