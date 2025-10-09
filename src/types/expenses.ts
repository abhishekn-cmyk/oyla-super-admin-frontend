export type Expense = {
  _id?: string;
  item?: string;
  category: string;
  amount: number;
  date?:string;
  quantity?: number;
  referenceNumber?: string;
  attachments?: string[];
};

export type ProfitLossReport = {
  productId: string;
  name: string;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  loss: number;
};

export interface AllocateExpensePayload {
  expenseId: string;
  productId: string;
  amount: number;
  expenseAmount:number;
}