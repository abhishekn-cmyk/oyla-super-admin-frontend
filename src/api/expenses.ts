import type { Expense, ProfitLossReport,AllocateExpensePayload } from "../types/expenses";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all expenses
export const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await fetch(`${API_URL}/expenses/expense`);
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
};
export const allocateExpense = async (data: AllocateExpensePayload): Promise<any> => {
  const res = await fetch(`${API_URL}/expenses/allocate-expense`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to allocate expense");
  return res.json();
};
// Add new expense (FormData)
export const addExpense = async (data: FormData): Promise<Expense> => {
  const res = await fetch(`${API_URL}/expenses/expense`, {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Failed to add expense");
  return res.json();
};

// Fetch profit & loss report
export const fetchProfitLoss = async (): Promise<ProfitLossReport[]> => {
  const res = await fetch(`${API_URL}/expenses/profit-loss`);
  if (!res.ok) throw new Error("Failed to fetch profit & loss");
  return res.json();
};
