import axios from "axios";
import type { IRestaurant } from "../types/restarunt";
import type { IProduct } from "../types/product";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

// ----- Restaurant CRUD -----
export const fetchRestaurants = async (): Promise<IRestaurant[]> => {
  const res = await axios.get(`${API_BASE_URL}/restaurant`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const createRestaurant = async (data: FormData): Promise<IRestaurant> => {
  const res = await axios.post(`${API_BASE_URL}/restaurant`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const updateRestaurant = async (id: string, data: FormData): Promise<IRestaurant> => {
  const res = await axios.put(`${API_BASE_URL}/restaurant/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const deleteRestaurant = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/restaurant/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// ----- Menu / PopularMenu CRUD -----
export const addProductToMenu = async (restaurantId: string, data: FormData): Promise<IProduct> => {
  const res = await axios.post(`${API_BASE_URL}/restaurant/${restaurantId}/menu`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const addProductToPopularMenu = async (restaurantId: string, data: FormData): Promise<IProduct> => {
  const res = await axios.post(`${API_BASE_URL}/restaurant/${restaurantId}/popularMenu`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
