import API from "../utils/api";

export interface CarouselType {
  _id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}
console.log(API);

// Public route - active carousels
export const getActiveCarousels = async () => {
  const res = await API.get("/carousel/active");
  return res.data;
};

// Admin routes
export const getAllCarousels = async () => {
  const res = await API.get("/carousel");
  return res.data;
};

export const getCarouselById = async (id: string) => {
  const res = await API.get(`/carousel/${id}`);
  return res.data;
};

export const createCarousel = async (formData: FormData) => {
  const res = await API.post("/carousel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCarousel = async (id: string, formData: FormData) => {
  const res = await API.put(`/carousel/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCarousel = async (id: string) => {
  const res = await API.delete(`/carousel/${id}`);
  return res.data;
};
