import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPrograms,
  searchPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  addProgramProduct,
  updateProgramProduct,
  deleteProgramProduct,
} from "../api/program";
import type { IProgram } from "../types/program";

// Fetch all programs
export const useGetPrograms = () => {
  return useQuery<IProgram[], Error>({
    queryKey: ["programs"],
    queryFn: getPrograms,
  });
};

// Search programs
export const useSearchPrograms = (query: string) => {
  return useQuery<IProgram[], Error>({
    queryKey: ["programs", "search", query],
    queryFn: () => searchPrograms(query),
  });
};

// Create program
export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createProgram(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
};

// Update program
export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateProgram(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
};

// Delete program
export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
};

// Program product hooks
export const useAddProgramProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: FormData }) => addProgramProduct(programId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
};

export const useUpdateProgramProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, productId, data }: { programId: string; productId: string; data: FormData }) =>
      updateProgramProduct(programId, productId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
};

export const useDeleteProgramProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, productId }: { programId: string; productId: string }) =>
      deleteProgramProduct(programId, productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
};
