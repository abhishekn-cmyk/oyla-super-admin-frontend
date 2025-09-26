import type { IProduct } from "./product";

export interface IRestaurant {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  features?: string[];
  rating?: number;
  address?: string;
  menu: IProduct[];
  popularMenu: IProduct[];
  createdAt?: string;
  updatedAt?: string;
  location:{
    lat:number;
    lng:number;
  }
}
