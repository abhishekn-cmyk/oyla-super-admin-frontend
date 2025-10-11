import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/delivery/reports";

export interface RevenueMeal {
  _id:string;
  productId: {
    name:string;
    costPrice:string;
    price:number;
    status:string;
  };
  productName: string;
  mealType?: "breakfast" | "lunch" | "dinner"; // optional if not always present
  slot:"breakfast" | "lunch" | "dinner";
  price?: number;
  quantity: number;
  status: string;
  expectedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  delayMinutes?: number;
}


export interface RevenueOrder {
  orderId: string;
  date: Date;
  total: number;
  meals: RevenueMeal[];
}

export interface RevenueSubscription {
  subscriptionId: string;
  user: {
    userId: string;
    name: string;
    email: string;
  };
  subscriptionDetails: {
    plan: string;
    startDate: Date;
    endDate: Date;
  };
  subscriptionTotal: number;
  orders: RevenueOrder[];
  
}



export interface DeliveryDelay {
  _id:string;
  orderId: string;
  userId: {
    userId: string;
    name: string;
    email: string;
  };
  subscriptionId?: {
    planName:string;
    planType :string;
    startDate:string;
    endDate:string;
  }
  date: Date;
  delayedMeals: RevenueMeal[];
  meals:RevenueMeal[];
  orderStatus:string;
  status:string;
  paymentStatus:string;
  createdAt:string;
}
type UserAnalytics = {
  userId: string;
  username: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
};
type PartnerAnalytics = {
  partnerId: string;
  name: string;
  totalDeliveries: number;
  delayedDeliveries: number;
};


export interface RevenueReport {
  totalRevenue: number;
  totalSubscriptions: number;
  totalDelayedOrders: number;
  averageDelayMinutes: number;
  subscriptions: RevenueSubscription[];
  deliveryDelays: DeliveryDelay[];
  userData:UserAnalytics[];
  userAnalytics:UserAnalytics[];
  deliveryPartnerAnalytics:PartnerAnalytics[];
}

export type DeliveryDelayReport = {
  delayedOrders: DeliveryDelay[];
};
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // adjust key if needed
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchRevenueReport = async (): Promise<RevenueReport> => {
  const { data } = await axios.get(`${API_URL}/revenue`, {
    headers: getAuthHeader(),
  });
  console.log(data);
  return data;
};

export const fetchDeliveryDelayReport = async (): Promise<DeliveryDelayReport> => {
  const { data } = await axios.get(`${API_URL}/delivery-delays`, {
    headers: getAuthHeader(),
  });
  return data;
};

