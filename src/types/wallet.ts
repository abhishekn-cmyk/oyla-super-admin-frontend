import type  { IUser } from "./user";
export interface IWallet {
  _id: string;
  balance: number;
  currency: string;
}

export interface IWalletHistory {
  _id: string;
  userId: IUser;
  walletId: IWallet;
  amount: number;
  type: "credit" | "debit";
  transactionDate: string;
  description?: string;
}
