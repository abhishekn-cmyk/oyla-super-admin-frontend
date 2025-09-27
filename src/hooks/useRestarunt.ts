import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addProductToMenu,
  addProductToPopularMenu,
} from "../api/restarunt";
import type { IRestaurant } from "../types/restarunt";


// -------------------- Queries --------------------
export const useRestaurants = () =>
  useQuery<IRestaurant[], Error>(
    {
      queryKey: ["restaurants"],
      queryFn: fetchRestaurants,
      staleTime: 5 * 60 * 1000,
      onError: (err: Error) => toast.error(err.message || "Failed to fetch restaurants"),
    } as UseQueryOptions<IRestaurant[], Error>
  );

// -------------------- Mutations --------------------
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createRestaurant(data),
    onSuccess: () => {
      toast.success("Restaurant created successfully!");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create restaurant"),
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateRestaurant(id, data),
    onSuccess: () => {
      toast.success("Restaurant updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update restaurant"),
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRestaurant(id),
    onSuccess: () => {
      toast.success("Restaurant deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete restaurant"),
  });
};

export const useAddProductToMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: string; data: FormData }) =>
      addProductToMenu(restaurantId, data),
    onSuccess: () => {
      toast.success("Product added to menu successfully!");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to add product to menu"),
  });
};

export const useAddProductToPopularMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: string; data: FormData }) =>
      addProductToPopularMenu(restaurantId, data),
    onSuccess: () => {
      toast.success("Product added to popular menu successfully!");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to add product to popular menu"),
  });
};
