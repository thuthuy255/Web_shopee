import { useQuery } from "@tanstack/react-query";
import {
  GetAnnualRevenueStatistics,
  GetProductPercentageByCategoryAsync,
  GetStatisticAdminAsync,
} from "./stastic.api";

export const queryGetStatisticAdminAsync = () => {
  return useQuery<any>({
    queryKey: ["QueryGetStatisticAdminAsync"],
    queryFn: () => GetStatisticAdminAsync(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    enabled: true,
  });
};

export const queryGetAnnualRevenueStatistics = (params: any) => {
  return useQuery<any>({
    queryKey: ["queryGetAnnualRevenueStatistics", params],
    queryFn: () => GetAnnualRevenueStatistics(params),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60,
    enabled: !!params,
  });
};

export const queryGetProductPercentageByCategory = () => {
  return useQuery<any>({
    queryKey: ["queryGetProductPercentageByCategoryAsync"],
    queryFn: () => GetProductPercentageByCategoryAsync(),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60,
    enabled: true,
  });
};
