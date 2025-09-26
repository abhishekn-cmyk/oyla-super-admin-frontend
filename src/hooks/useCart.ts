// hooks/cart.ts
import { useQuery } from "@tanstack/react-query";
import { getFullCart } from "../api/cart";
import { type CartItem } from "../types/cart";

export const useGetFullCart = () => {
  return useQuery<CartItem[], Error>({
    queryKey: ["fullCart"],
    queryFn: getFullCart,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
