// api/auth.ts
import { type ISuperAdmin,type ISuperAdminPolicies } from "../types/auth";
import axios from "axios";
interface LoginResponse {
  token: string;
  superadmin: ISuperAdmin;
  message: string;
}

export const loginSuperAdmin = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Login failed");

  return data;
};



const API_URL = import.meta.env.VITE_API_URL;

export const getSuperAdminPolicies = async (id: string): Promise<ISuperAdminPolicies> => {
  const { data } = await axios.get(`${API_URL}/admin/${id}/policies`);
  return data;
};

export const updateSuperAdminPolicies = async (
  id: string,
  policies: ISuperAdminPolicies
): Promise<ISuperAdminPolicies> => {
  const { data } = await axios.put(`${API_URL}/admin/${id}/policies`, policies);
  return data;
};
