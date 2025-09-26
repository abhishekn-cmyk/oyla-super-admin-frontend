import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/carousel";
import { type ICarousel } from "../types/carousel";

export const useCarousels = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ICarousel[], Error>({
    queryKey: ["carousels"],
    queryFn: async () => {
      const res = await api.get("/carousel/active");
      return res.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/carousel", formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["carousels"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.put(`/carousel/${id}`, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["carousels"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/carousel/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["carousels"] }),
  });

  return { carousels: data ?? [], isLoading, error, addMutation, updateMutation, deleteMutation };
};
