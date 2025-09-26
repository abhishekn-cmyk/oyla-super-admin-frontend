import { useQuery } from "@tanstack/react-query";
import { fetchWalletHistories } from "../api/wallet";
import { type IWalletHistory } from "../types/wallet";

export const useWalletHistories = () => {
  return useQuery<IWalletHistory[], Error>({
    queryKey: ["walletHistories"],       // ✅ array as key
    queryFn: fetchWalletHistories,       // ✅ fetch function
    staleTime: 5 * 60 * 1000,            // 5 minutes
  });
};

