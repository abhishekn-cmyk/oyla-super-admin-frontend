import { useQuery, useMutation, type UseMutationOptions, type UseQueryOptions,useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { PrivacyPolicy } from "../types/privacy";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL;

// ------------------ GET ACTIVE PRIVACY POLICY ------------------
export const useGetActivePrivacyPolicy = (options?: UseQueryOptions<PrivacyPolicy>) => {
  return useQuery<PrivacyPolicy>({
    queryKey: ["privacy", "active"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/privacy/active`);
      return res.data;
    },
    ...options,
  });
};

// ------------------ GET ALL PRIVACY POLICIES ------------------
export const useGetAllPrivacyPolicies = (options?: UseQueryOptions<PrivacyPolicy[]>) => {
  return useQuery<PrivacyPolicy[]>({
    queryKey: ["privacy", "all"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/privacy/all`);
      return res.data;
    },
    ...options,
  });
};

// ------------------ CREATE PRIVACY POLICY ------------------
export const useCreatePrivacyPolicy = (options?: UseMutationOptions<PrivacyPolicy, Error, PrivacyPolicy>) => {
  return useMutation<PrivacyPolicy, Error, PrivacyPolicy>({
    mutationFn: async (data: PrivacyPolicy) => {
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("SuperAdmin token not found");

      const res = await axios.post(`${API_URL}/privacy/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    ...options,
  });
};
export const useDeletePrivacyPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyId: string) => {
     const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/privacy/delete/${policyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
   onSuccess: (data) => {
      toast.success(data.message || "Policy deleted successfully");
      queryClient.invalidateQueries({queryKey:["getAllPrivacyPolicies"]}); // refresh list
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error deleting policy");
    },
  });
  };
// ------------------ UPDATE PRIVACY POLICY ------------------
export const useUpdatePrivacyPolicy = (options?: UseMutationOptions<PrivacyPolicy, Error, { policyId: string; data: PrivacyPolicy }>) => {
  return useMutation<PrivacyPolicy, Error, { policyId: string; data: PrivacyPolicy }>({
    mutationFn: async ({ policyId, data }) => {
    const token = localStorage.getItem("token");
      if (!token) throw new Error("SuperAdmin token not found");

      const res = await axios.put(`${API_URL}/privacy/update/${policyId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    ...options,
  });
};
