import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Expense, ProfitLossReport,AllocateExpensePayload } from "../types/expenses";
import { fetchExpenses, addExpense, fetchProfitLoss,allocateExpense } from "../api/expenses";

// ---------------- Expenses ----------------
export const useExpenses = () => {
  return useQuery<Expense[], Error>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });
};

// ---------------- Add Expense ----------------
export const useAddExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, FormData>({
    mutationFn: addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:["expenses"]});
    },
  });
};

// ---------------- Profit & Loss ----------------
export const useProfitLoss = () => {
  return useQuery<ProfitLossReport[], Error>({
    queryKey: ["profitLoss"],
    queryFn: fetchProfitLoss,
  });
};


export const useAllocateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, AllocateExpensePayload>({
    mutationFn: allocateExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
};