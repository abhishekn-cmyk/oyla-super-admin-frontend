// types/carousel.ts
export interface ICarousel {
  _id: string;
  title: string;
  description?: string;
  image: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
