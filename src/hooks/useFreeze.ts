import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Freeze } from "../types/freeze";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

// Get all freezes for a user (superadmin)
export const useGetFreezes = () =>
  useQuery<Freeze[]>({
    queryKey: ["freezes"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/freeze/all/all/full`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

// Create freeze
export const useAddFreeze = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; freeze: Freeze }) => {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/freeze/superadmin/${data.userId}`, data.freeze, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: ( variables) => {
      toast.success("Freeze added!");
      queryClient.invalidateQueries({ queryKey: ["freezes", variables.userId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Error adding freeze"),
  });
};

// Update freeze
// Update freeze
export const useUpdateFreeze = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      freezeId: string;
      userId: string;
      updates: Partial<Freeze>;
    }) => {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/freeze/superadmin/${data.userId}/${data.freezeId}`,
        data.updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: (_data) => {
      toast.success("Freeze updated!");
      queryClient.invalidateQueries({ queryKey: ["freezes"] }); // ✅ no need userId filter, since we fetch all freezes
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Error updating freeze"),
  });
};


// Delete freeze
export const useDeleteFreeze = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { freezeId: string; userId: string }) => {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/freeze/superadmin/${data.userId}/${data.freezeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: ( variables) => {
      toast.success("Freeze deleted!");
      queryClient.invalidateQueries({ queryKey: ["freezes", variables.userId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Error deleting freeze"),
  });
};
