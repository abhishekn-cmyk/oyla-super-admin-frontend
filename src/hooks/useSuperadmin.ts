import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// --- Types ---
export interface SuperAdminProfile {
  username?: string;
  email?: string;
  profileImage?: File;
}

export interface UpdatePassword {
  oldPassword: string;
  newPassword: string;
}

// --- Hooks ---
export const useUpdateProfile = (
  options?: UseMutationOptions<any, Error, SuperAdminProfile>
) => {
  return useMutation<any, Error, SuperAdminProfile>({
    mutationFn: async (data: SuperAdminProfile) => {
      const stored = JSON.parse(localStorage.getItem("superadmin") || "{}");
      const id = stored.superadmin?._id;
      const token = localStorage.getItem("token");

      if (!id || !token) throw new Error("SuperAdmin info missing in localStorage");

      const formData = new FormData();
      if (data.username) formData.append("username", data.username);
      if (data.email) formData.append("email", data.email);
      if (data.profileImage) formData.append("profileImage", data.profileImage);

      const res = await axios.put(`${API_URL}/admin/update-profile/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data;
    },
    ...options,
  });
};

export const useUpdatePassword = (
  options?: UseMutationOptions<any, Error, UpdatePassword>
) => {
  return useMutation<any, Error, UpdatePassword>({
    mutationFn: async (data: UpdatePassword) => {
      const stored = JSON.parse(localStorage.getItem("superadmin") || "{}");
      const id = stored.superadmin?._id;
      const token = localStorage.getItem("token");

      if (!id) throw new Error("SuperAdmin ID not found");
     

      const res = await axios.put(`${API_URL}/admin/update-password/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    ...options,
  });
};




