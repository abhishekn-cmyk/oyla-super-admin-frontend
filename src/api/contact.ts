import axios from "axios";
import { type IContact } from "../types/contact";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${token}` }
});

export const getContacts = async (): Promise<IContact[]> => {
  const res = await axiosInstance.get("/contactus");
  return res.data;
};

export const getContactById = async (id: string): Promise<IContact> => {
  const res = await axiosInstance.get(`/contactus/${id}`);
  return res.data;
};

export const addContact = async (contact: Partial<IContact>): Promise<IContact> => {
  const res = await axiosInstance.post("/contactus", contact);
  return res.data;
};

export const updateContact = async (
  id: string,
  contact: Partial<IContact>
): Promise<IContact> => {
  const res = await axiosInstance.put(`/contactus/${id}`, contact);
  return res.data;
};
