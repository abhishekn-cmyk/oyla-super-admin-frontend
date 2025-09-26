import axios from "axios";
import { type IWalletHistory } from "../types/wallet";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");

export const fetchWalletHistories = async (): Promise<IWalletHistory[]> => {
  const response = await axios.get(`${API_BASE_URL}/wallet/histories/all`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};
