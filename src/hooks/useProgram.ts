import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "react-toastify";
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

// --- Queries ---

export const useGetPrograms = () =>
  useQuery<IProgram[], Error>(
    {
      queryKey: ["programs"],
      queryFn: getPrograms,
      onError: (err: Error) => toast.error(err.message),
      staleTime: 5 * 60 * 1000,
    } as UseQueryOptions<IProgram[], Error>
  );

export const useSearchPrograms = (query: string) =>
  useQuery<IProgram[], Error>(
    {
      queryKey: ["programs", "search", query],
      queryFn: () => searchPrograms(query),
      onError: (err: Error) => toast.error(err.message),
      enabled: !!query,
    } as UseQueryOptions<IProgram[], Error>
  );

// --- Mutations ---

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createProgram(data),
    onSuccess: () => {
      toast.success("Program created successfully!");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create program"),
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateProgram(id, data),
    onSuccess: () => {
      toast.success("Program updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update program"),
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess: () => {
      toast.success("Program deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete program"),
  });
};

// --- Program Product Mutations ---

export const useAddProgramProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: FormData }) =>
      addProgramProduct(programId, data),
    onSuccess: () => {
      toast.success("Product added to program!");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to add product"),
  });
};

export const useUpdateProgramProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, productId, data }: { programId: string; productId: string; data: FormData }) =>
      updateProgramProduct(programId, productId, data),
    onSuccess: () => {
      toast.success("Program product updated!");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update product"),
  });
};

export const useDeleteProgramProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, productId }: { programId: string; productId: string }) =>
      deleteProgramProduct(programId, productId),
    onSuccess: () => {
      toast.success("Program product deleted!");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete product"),
  });
};
