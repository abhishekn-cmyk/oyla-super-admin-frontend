import type  { IUser } from "./user";

export interface IOrderItem {
  product: string | null;
  quantity: number;
  price: number;
  _id: string;
}

export interface IOrder {
  _id: string;
  userId: IUser;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IOrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}