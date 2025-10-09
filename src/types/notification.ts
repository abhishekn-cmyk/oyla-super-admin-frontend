// types/notification.ts
export interface UserType {
  _id: string;
  username?: string;
  email?: string;
  role?: string;
}

export interface CartType {
  cartId: string;
  totalPrice: number;
}

export interface SubscriptionType {
  subscriptionId: string;
  planName: string;
  status: string;
}

export interface OrderType {
  orderId: string;
  status: string;
  totalAmount: number;
}

export interface NotificationType {
  _id: string;
  title: string;
  message: string;
  type: "subscription" | "cart" | "order" | string;
  priority?: "low" | "medium" | "high";
  channel?: string;
  createdAt: string;
  user: UserType;
  cart?: CartType;
  subscription?: SubscriptionType;
  order?: OrderType;
  read:boolean;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: NotificationType[];
  counts: {
    subscription: number;
    cart: number;
    order: number;
  };
}
