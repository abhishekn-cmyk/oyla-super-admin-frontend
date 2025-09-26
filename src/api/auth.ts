// api/auth.ts
import { type ISuperAdmin } from "../types/auth";

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
