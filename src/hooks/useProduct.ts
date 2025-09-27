import { useQuery, useMutation, useQueryClient ,type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { IProduct } from "../types/product";
import * as api from "../api/product"; // your axios API wrapper

// --- Queries ---
// Fetch all products
export const useProducts = () =>
  useQuery<IProduct[], Error>({
    queryKey: ["products"],
    queryFn: api.getProducts,
    staleTime: 5 * 60 * 1000,
    onError: (err: Error) => toast.error(err.message),
  } as UseQueryOptions<IProduct[], Error>); // ✅ cast to UseQueryOptions

export const useProductById = (id: string) =>
  useQuery<IProduct, Error>({
    queryKey: ["product", id],
    queryFn: () => api.getProductById(id),
    enabled: !!id,
    onError: (err: Error) => toast.error(err.message),
  } as UseQueryOptions<IProduct, Error>); // ✅ cast to UseQueryOptions

// --- Mutations ---
// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.createProduct(formData),
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.updateProduct(id, formData),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
