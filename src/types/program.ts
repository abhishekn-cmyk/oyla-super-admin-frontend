// types/program.ts
import type { IProduct } from "./product";

export interface IProgram {
  _id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  category: string;
  image?: string;
  product: IProduct[]; // embedded products
  createdAt?: string;
  updatedAt?: string;
}
