import type { IProduct } from "./product";

export interface IMeal {
  _id: string;
  productId?: IProduct | string;
  quantity: number;
  status: string;
  date: string;
  slot?: string;
  price?: number;
  costPrice?: number;
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
}

export interface ISubscription {
  _id: string;
  date?: string;
  durationDays?: number;
  price?: number;
  planName?: string;
  planType?: string;
  totalMeals?: number;
  mealsPerDay?: number;
  currency?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface IPayment {
  _id: string;
  userId: string | IUser;
  subscriptionId?: string | ISubscription;
  amount: number;
  currency: string;
  gateway: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  _id: string;
  userId: IUser;
  subscriptionId?: ISubscription | string;
  meals: IMeal[];
  orderStatus: string; // Fixed: using orderStatus instead of status
  paymentStatus: string; // Added payment status
  paymentMethod: string;
  status: string; // Keep this for backward compatibility
  payment?: IPayment;
  date?: string;
  count:number;
  revenue:number;
  createdAt: string;
  totalPrice?: number;
  totalCost?: number;
  profit?: number;
  currency?: string;
}

export interface IOrderStats {
  totalOrders: number;
  statusCount: {
    scheduled?: number;
    prepared?: number;
    dispatched?: number;
    delivered?: number;
    delayed?: number;
    pending?: number;
    completed?: number;
    cancelled?: number;
  };
  totalRevenue: number;
  totalCost?: number;
  totalProfit?: number;
  scheduledRevenue?: number;
  deliveredRevenue?: number;
  last7DaysOrders: IOrder[];
 dailyOrders: IDailyOrderStats[];

  allOrders: IOrder[]; // MISSING: Add this for the orders list
}

// ADD THESE MISSING INTERFACES:

// For daily orders breakdown in analytics
export interface IDailyOrderStats {
  date: string;
  count: number;
  revenue: number;
  cost: number;
  profit: number;
}

// Update IOrderStats to include the correct dailyOrders type
export interface IOrderStats {
  totalOrders: number;
  statusCount: {
    scheduled?: number;
    prepared?: number;
    dispatched?: number;
    delivered?: number;
    delayed?: number;
    pending?: number;
    completed?: number;
    cancelled?: number;
  };
  totalRevenue: number;
  totalCost?: number;
  totalProfit?: number;
  scheduledRevenue?: number;
  deliveredRevenue?: number;
  last7DaysOrders: IOrder[];
 dailyOrders: IDailyOrderStats[]; // FIXED: This should be IDailyOrderStats[], not IOrder[]
  count:number;
  revenue:number;
  
  allOrders: IOrder[]; // <-- Add this line
}

// For API response structure
export interface IOrdersResponse {
  data: IOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface IOrderStatsResponse {
  data: IOrderStats;
}

// For order filters
export interface IOrderFilters {
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// For order creation/update
export interface ICreateOrder {
  userId: string;
  subscriptionId?: string;
  meals: Array<{
    productId: string;
    quantity: number;
    slot?: string;
    date: string;
  }>;
  paymentMethod: string;
  status?: string;
}

// For order status update
export interface IUpdateOrderStatus {
  orderId: string;
  status: string;
}

// For meal status update
export interface IUpdateMealStatus {
  orderId: string;
  mealId: string;
  status: string;
}

// For pagination
export interface IPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Extended order stats for analytics
export interface IExtendedOrderStats extends IOrderStats {
  averageOrderValue: number;
  conversionRate: number;
  popularProducts: Array<{
    product: IProduct | string;
    count: number;
    revenue: number;
  }>;
  customerStats: {
    totalCustomers: number;
    repeatCustomers: number;
    newCustomers: number;
  };
}