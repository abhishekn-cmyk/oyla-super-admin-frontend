import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

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
const getAuthToken = () => localStorage.getItem("token");

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    "Content-Type": "multipart/form-data",
  },
});

// -------------------- API FUNCTIONS --------------------
const fetchSuccessStories = async (): Promise<SuccessStory[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/success`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  return data;
};

const createSuccessStory = async (story: FormData): Promise<SuccessStory> => {
  const { data } = await axios.post(`${API_BASE_URL}/success`, story, getConfig());
  return data;
};

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

const deleteSuccessStory = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/success/${id}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
};

// -------------------- REACT QUERY HOOKS --------------------

// Fetch
export const useSuccessStories = () =>
  useQuery<SuccessStory[], Error>(
    {
      queryKey: ["successStories"],
      queryFn: fetchSuccessStories,
      onError: (err: Error) => toast.error(err.message || "Failed to fetch success stories"),
    } as UseQueryOptions<SuccessStory[], Error>
  );

// Create
export const useCreateSuccessStory = () => {
  const queryClient = useQueryClient();

  return useMutation<SuccessStory, Error, FormData>({
    mutationFn: (story: FormData) => createSuccessStory(story),
    onSuccess: () => {
      toast.success("Success story created!");
      queryClient.invalidateQueries({ queryKey: ["successStories"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create success story"),
  });
};

// Update
export const useUpdateSuccessStory = () => {
  const queryClient = useQueryClient();
 return useMutation<SuccessStory, Error, { id: string; story: FormData }>({
  mutationFn: ({ id, story }) => updateSuccessStory({ id, story }),
  onSuccess: () => {
    toast.success("Success story updated!");
    queryClient.invalidateQueries({ queryKey: ["successStories"] });
  },
  onError: (err: any) => toast.error(err.message || "Failed to update success story"),
});

};

// Delete
export const useDeleteSuccessStory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
  mutationFn: (id: string) => deleteSuccessStory(id),
  onSuccess: () => {
    toast.success("Success story deleted!");
    queryClient.invalidateQueries({ queryKey: ["successStories"] });
  },
  onError: (err: any) => toast.error(err.message || "Failed to delete success story"),
});

};
