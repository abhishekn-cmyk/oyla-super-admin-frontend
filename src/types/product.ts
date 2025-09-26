// types/product.ts
export type MealType =
  | "veg"
  | "non-veg"
  | "vegan"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "soup"
  | "salad"
  | "biriyani"
  | "main-meal";

export type ProductCategory = "main" | "breakfast" | "snack" | "salad" | "dessert" | "beverage";

export interface INutrition {
  fat?: string;          // e.g., "10g"
  carbohydrate?: string; // e.g., "10g"
  protein?: string;      // optional
  calories?: string;     // optional
}

export interface IProduct {
  _id: string;
  name: string;
  tagline?: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  features: string;
  stock: number;
  nutrition?: INutrition;
  ingredients?: string[];
  mealType?: MealType;
  availableDates: string[]; // use string[] in frontend (ISO dates)
  category?: ProductCategory;
  createdAt?: string;
  updatedAt?: string;
}
