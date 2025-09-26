import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IProduct } from "../types/product";
import * as api from "../api/product"; // your axios API wrapper

// --- React Query hooks ---
export const useProducts = () =>
  useQuery<IProduct[], Error>({
    queryKey: ["products"],
    queryFn: api.getProducts, // uses token internally
    staleTime: 5 * 60 * 1000,
  });

export const useProductById = (id: string) =>
  useQuery<IProduct, Error>({
    queryKey: ["product", id],
    queryFn: () => api.getProductById(id),
  });

// --- Mutations ---
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.createProduct(formData), // token handled in api
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.updateProduct(id, formData), // token handled in api
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id), // token handled in api
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
