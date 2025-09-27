import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

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

// -------------------- HOOKS --------------------

export const useUpdateProfile = (
  options?: UseMutationOptions<any, Error, SuperAdminProfile>
) => {
  return useMutation<any, Error, SuperAdminProfile>({
    mutationFn: async (data: SuperAdminProfile) => {
      const stored = JSON.parse(localStorage.getItem("superadmin") || "{}");
      const id = stored._id; // ✅ directly use _id
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
    onSuccess: (data, variables, context, mutationContext) => {
      toast.success("Profile updated successfully!");
      options?.onSuccess?.(data, variables, context, mutationContext);
    },
    onError: (error: any, variables, context, mutationContext) => {
      toast.error(error?.message || "Failed to update profile");
      options?.onError?.(error, variables, context, mutationContext);
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
      const id = stored._id;
      const token = localStorage.getItem("token");

      console.log(stored, id, token);

      if (!id || !token) throw new Error("SuperAdmin info missing in localStorage");

      const res = await axios.put(`${API_URL}/admin/update-password/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data;
    },
    onSuccess: (data, variables, context, mutationContext) => {
      toast.success("Password updated successfully!");
      options?.onSuccess?.(data, variables, context, mutationContext);
    },
    onError: (error: any, variables, context, mutationContext) => {
      toast.error(error?.message || "Failed to update password");
      options?.onError?.(error, variables, context, mutationContext);
    },
    ...options,
  });
};






