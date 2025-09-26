import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addProductToMenu,
  addProductToPopularMenu,
} from "../api/restarunt";
import { type IRestaurant } from "../types/restarunt";
import type { IProduct } from "../types/product";
// -------------------- Queries --------------------
export const useRestaurants = () => {
  return useQuery<IRestaurant[], Error>({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
    staleTime: 5 * 60 * 1000,
  });
};

// -------------------- Mutations --------------------
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation<IRestaurant, Error, FormData>({
    mutationFn: (data) => createRestaurant(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation<IRestaurant, Error, { id: string; data: FormData }>({
    mutationFn: ({ id, data }) => updateRestaurant(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteRestaurant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
  });
};

export const useAddProductToMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<IProduct, Error, { restaurantId: string; data: FormData }>({
    mutationFn: ({ restaurantId, data }) => addProductToMenu(restaurantId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
  });
};

export const useAddProductToPopularMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<IProduct, Error, { restaurantId: string; data: FormData }>({
    mutationFn: ({ restaurantId, data }) => addProductToPopularMenu(restaurantId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
  });
};
