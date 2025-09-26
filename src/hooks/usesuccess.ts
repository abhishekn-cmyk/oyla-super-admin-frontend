import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface SuccessStory {
  _id: string;
  title: string;
  description: string;
  image?: string;
  author?: string;
  role: string;
  date: string;
  isActive: boolean;
}

// -------------------- HELPERS --------------------

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token"); // adjust key if needed
};

// Axios config with Authorization header
const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    "Content-Type": "multipart/form-data", // for POST/PUT
  },
});

// -------------------- API FUNCTIONS --------------------

// Fetch all stories
const fetchSuccessStories = async (): Promise<SuccessStory[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/success`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  console.log(data);
  return data;
};

// Create story
const createSuccessStory = async (story: FormData): Promise<SuccessStory> => {
  const { data } = await axios.post(`${API_BASE_URL}/success`, story, getConfig());
  return data;
};

// Update story
const updateSuccessStory = async ({
  id,
  story,
}: {
  id: string;
  story: FormData;
}): Promise<SuccessStory> => {
  const { data } = await axios.put(`${API_BASE_URL}/success/${id}`, story, getConfig());
  return data;
};

// Delete story
const deleteSuccessStory = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/success/${id}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
};

// -------------------- REACT QUERY HOOKS --------------------

export const useSuccessStories = () => {
  return useQuery<SuccessStory[], Error>({
    queryKey: ["successStories"],
    queryFn: fetchSuccessStories,
  });
};

export const useCreateSuccessStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSuccessStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["successStories"] });
    },
  });
};

export const useUpdateSuccessStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSuccessStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["successStories"] });
    },
  });
};

export const useDeleteSuccessStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSuccessStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["successStories"] });
    },
  });
};
