// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import * as categoryApi from "../api/category";
import type { ICategory } from "../types/category";

// Fetch all categories
export const useCategories = (type?: string) => {
  return useQuery<ICategory[], Error>({
    queryKey: ["categories", type] as QueryKey,
    queryFn: () => categoryApi.getCategories(type),
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};

// Fetch single category by ID
export const useCategory = (id: string) => {
  return useQuery<ICategory, Error>({
    queryKey: ["category", id] as QueryKey,
    queryFn: () => categoryApi.getCategoryById(id),
    enabled: !!id, // only run if id exists
  });
};

// Add a new category
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Omit<ICategory, "_id" | "createdAt">) =>
      categoryApi.addCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICategory> }) =>
      categoryApi.updateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
