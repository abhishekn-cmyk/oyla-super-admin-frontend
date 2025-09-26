// api/cart.ts
import axios from "axios";
import {  type CartItem } from "../types/cart";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

export const getFullCart = async (): Promise<CartItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart/full/cart-details`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch full cart:", error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};
