// api/categoryApi.ts
import axios from "axios";
import type { ICategory } from "../types/category";

const BASE_URL = `${import.meta.env.VITE_API_URL}/expenses`;

export const getCategories = async (type?: string): Promise<ICategory[]> => {
  const response = await axios.get(`${BASE_URL}/category`, { params: { type } });
  return response.data.data;
};

export const getCategoryById = async (id: string): Promise<ICategory> => {
  const response = await axios.get(`${BASE_URL}/${id}/category`);
  return response.data.data;
};

export const addCategory = async (category: Omit<ICategory, "_id" | "createdAt">): Promise<ICategory> => {
  const response = await axios.post(`${BASE_URL}/category`, category);
  return response.data.data;
};

export const updateCategory = async (id: string, category: Partial<ICategory>): Promise<ICategory> => {
  const response = await axios.put(`${BASE_URL}/${id}/category`, category);
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${BASE_URL}/${id}/category`);
  return response.data;
};
