// api/users.ts
import {type IUser } from "../types/user";

export const getAllUsers = async (): Promise<IUser[]> => {
  const token = localStorage.getItem("token"); // superadmin token
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to fetch users");

  // Return the "users" array
  return data.users;
};

