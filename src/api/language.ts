import axios from "axios";
import type { LanguageType } from "../types/language";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getLanguages = async (): Promise<LanguageType[]> => {
  const res = await axios.get(`${API_URL}/language`, {
    headers: getAuthHeader(),
  });
  return res.data.languages;
};

export const getLanguageById = async (id: string): Promise<LanguageType> => {
  const res = await axios.get(`${API_URL}/language/${id}`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const createLanguage = async (language: Partial<LanguageType>): Promise<LanguageType> => {
  const res = await axios.post(`${API_URL}/language`, language, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const updateLanguage = async (id: string, language: Partial<LanguageType>): Promise<LanguageType> => {
  const res = await axios.put(`${API_URL}/language/${id}`, language, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const deleteLanguage = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/language/${id}`, {
    headers: getAuthHeader(),
  });
};
