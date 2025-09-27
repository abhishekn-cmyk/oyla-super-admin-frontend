import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from "../api/language";
import type { LanguageType } from "../types/language";
import { toast } from "react-toastify";

// ✅ Fetch all languages
export const useLanguages = () => {
  return useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      try {
        return await getLanguages();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to fetch languages");
        throw err;
      }
    },
  });
};

// ✅ Create language
export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast.success("Language created successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create language");
    },
  });
};

// ✅ Update language
export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LanguageType> }) =>
      updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast.success("Language updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update language");
    },
  });
};

// ✅ Delete language
export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast.success("Language deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete language");
    },
  });
};
