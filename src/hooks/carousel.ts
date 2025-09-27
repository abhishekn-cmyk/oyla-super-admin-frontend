import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/carousel";
import { type ICarousel } from "../types/carousel";
import { toast } from "react-toastify";

export const useCarousels = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ICarousel[], Error>({
    queryKey: ["carousels"],
    queryFn: async () => {
      try {
        const res = await api.get("/carousel/active");
        return res.data;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to fetch carousels");
        throw err; // re-throw so React Query knows the query failed
      }
    },
  });

  const addMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/carousel", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
      toast.success("Carousel added successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add carousel");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.put(`/carousel/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
      toast.success("Carousel updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update carousel");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/carousel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
      toast.success("Carousel deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete carousel");
    },
  });

  return {
    carousels: data ?? [],
    isLoading,
    error,
    addMutation,
    updateMutation,
    deleteMutation,
  };
};
