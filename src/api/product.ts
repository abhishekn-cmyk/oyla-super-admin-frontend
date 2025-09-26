import axios from "axios";
import type { IProduct } from "../types/product";

const API_URL = import.meta.env.VITE_API_URL;

// Helper to get Authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async (): Promise<IProduct[]> => {
  const { data } = await axios.get(`${API_URL}/product`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const { data } = await axios.get(`${API_URL}/product/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const createProduct = async (formData: FormData) => {
  return axios.post(`${API_URL}/product`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProduct = async (id: string, formData: FormData) => {
  return axios.put(`${API_URL}/product/${id}`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProduct = async (id: string) => {
  return axios.delete(`${API_URL}/product/${id}`, {
    headers: getAuthHeaders(),
  });
};
