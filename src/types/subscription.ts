


import type { IProduct } from "./product";
import type { IUser } from "./user";

// -------------------- MEAL ENTRY --------------------
export interface IMealEntry {
  date: string; // ISO date string
  breakfast?: IProduct | string | null; // can be populated object or productId
  lunch?: IProduct | string | null;
  dinner?: IProduct | string | null;
  isLocked: boolean;
  status: "pending" | "delivered" | "skipped" | "cancelled"; // make status a union type
}

// -------------------- PAYMENT --------------------
export interface IPayment {
  _id: string;
  gateway: string;
  transactionId?: string;
  status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "completed"
    | "active"
    | "inactive" ;
  amountPaid: number;
  currency: string;
  paymentDate?: string;
  discountApplied?: number; // made optional
  balanceRemaining?: number; // made optional
  createdAt: Date | string;
}

// -------------------- FREEZE / SWAP HISTORY --------------------
export interface IFreezeHistory {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ISwapHistory {
  date: string;
  fromMeal: string;
  toMeal: string;
}

// -------------------- DELIVERY ADDRESS --------------------
export interface IDeliveryAddress {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

// -------------------- FULL SUBSCRIPTION --------------------
export interface ISubscription {
  _id: string;
  userId: IUser | string; // populated user object or userId
  planType: "basic" | "premium" | "pro";
  planName: string;
  startDate: string;
  endDate: string;
  status:
    | "active"
    | "paused"
    | "cancelled"
    | "expired"
    | "pending"
    | "completed" |"freeze"; // make explicit union

  autoRenew: boolean;
  price: number;
  currency: string;
  pauseCount: number;
  billingCycle: "monthly" | "quarterly" | "yearly" | "custom"; // allow flexibility
  mealsPerDay: number;
  totalMeals: number;
  consumedMeals: number;
  remainingMeals: number;
  durationDays: number;

  refundReason?: string;
  isPaused?: boolean;
  isLocked?: boolean;
  isFrozen?: boolean;
  lastDeliveredAt?: string;

  // delivery tracking
  deliveredMeals: number;
  pendingDeliveries: number;

  // frozen tracking
  frozenDays: number;
  freezeHistory: IFreezeHistory[];

  // swap tracking
  swappableMeals: number;
  swapHistory: ISwapHistory[];

  // cancellation info
  cancellationDate?: string;
  cancellationReason?: string;
  cancellationStatus?: "pending" | "processed" | "refunded";
  refundAmount?: number;
  penaltyAmount?: number;
  completedDays?: number;
  pendingDays?: number;

  // meals calendar
  meals: IMealEntry[];

  // delivery address
  deliveryAddress?: IDeliveryAddress; // made optional (some subscriptions might not have it yet)

  // payment
  payment?: IPayment; // single payment
  payments?: IPayment[]; // multiple payments if renewals

  // discount / points / unique code
  discountCode?: string;
  discountAmount?: number;
  externalPoints?: number;
  uniqueCode?: string;

  createdAt: string;
  updatedAt: string;
}


export interface SubscriptionActionResponse {
  success: boolean;
  message: string;
  subscription: ISubscription;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  averageRating: number;
  mealStats: {
    delivered: number;
    pending: number;
    cancelled: number;
    skipped: number;
  };
}