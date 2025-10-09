import { useQuery } from "@tanstack/react-query";
import { fetchRevenueReport, fetchDeliveryDelayReport, type RevenueReport, type DeliveryDelayReport } from "../api/reports";

export const useRevenueReport = () => {
  return useQuery<RevenueReport, Error>({
    queryKey: ["revenueReport"],
    queryFn: fetchRevenueReport,
  });
};

export const useDeliveryDelayReport = () => {
  return useQuery<DeliveryDelayReport, Error>({
    queryKey: ["deliveryDelayReport"],
    queryFn: fetchDeliveryDelayReport,
  });
};

