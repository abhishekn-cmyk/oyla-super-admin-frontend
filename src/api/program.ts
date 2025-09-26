import axios from "axios";
import type { IProgram } from "../types/program";


const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const instance = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// GET all programs
export const getPrograms = async (): Promise<IProgram[]> => {
  const res = await instance.get("/program");
  return res.data;
};

// SEARCH programs
export const searchPrograms = async (query: string): Promise<IProgram[]> => {
  const res = await instance.get(`/program/search?q=${query}`);
  return res.data;
};

// CREATE program
export const createProgram = async (data: FormData) => {
  const res = await instance.post("/program", data);
  return res.data;
};

// UPDATE program
export const updateProgram = async (id: string, data: FormData) => {
  const res = await instance.put(`/program/${id}`, data);
  return res.data;
};

// DELETE program
export const deleteProgram = async (id: string) => {
  const res = await instance.delete(`/program/${id}`);
  return res.data;
};

// ADD product to program
export const addProgramProduct = async (programId: string, data: FormData) => {
  const res = await instance.post(`/product/program/${programId}`, data);
  return res.data;
};

// UPDATE product in program
export const updateProgramProduct = async (programId: string, productId: string, data: FormData) => {
  const res = await instance.put(`/product/program/${programId}/product/${productId}`, data);
  return res.data;
};

// DELETE product in program
export const deleteProgramProduct = async (programId: string, productId: string) => {
  const res = await instance.delete(`/product/program/${programId}/product/${productId}`);
  return res.data;
};
