import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from "../api/language";
import type { LanguageType } from "../types/language";

// Fetch all languages
export const useLanguages = () => {
  return useQuery({ queryKey: ["languages"], queryFn: getLanguages });
};

// Create language
export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLanguage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["languages"] }),
  });
};

// Update language
export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LanguageType> }) =>
      updateLanguage(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["languages"] }),
  });
};

// Delete language
export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["languages"] }),
  });
};
