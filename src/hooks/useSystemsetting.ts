import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import instance from "../api/axios"; // your axios instance

interface UpdateChangeWindowResponse {
  message: string;
}

interface UpdateChangeWindowInput {
  days: number;
}

export const useUpdateChangeWindow = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateChangeWindowResponse, // response type
    Error,                      // error type
    UpdateChangeWindowInput      // input type
  >({
    mutationFn: async (input: UpdateChangeWindowInput) => {
      const { days } = input; // now properly typed
      const res = await instance.post("/subscription/update-change-window", { days });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Change window updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptionsStats"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update change window");
    },
  });
};
