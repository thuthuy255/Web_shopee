import { useQuery } from "@tanstack/react-query";
import {
  GetAnnualRevenueStatistics,
  GetAnnualRevenueStatisticsOfSeller,
  GetProductPercentageByCategoryAsync,
  GetProductPercentageByCategoryOfSeller,
  GetStatisticAdminAsync,
  GetStatisticSellerAsync,
} from "./stastic.api";

export const queryGetStatisticAdminAsync = () => {
  return useQuery<any>({
    queryKey: ["QueryGetStatisticAdminAsync"],
    queryFn: () => GetStatisticAdminAsync(),
    staleTime: 0,
    gcTime: 0,
    enabled: true,
  });
};

export const queryGetAnnualRevenueStatistics = (params: any) => {
  return useQuery<any>({
    queryKey: ["queryGetAnnualRevenueStatistics", params],
    queryFn: () => GetAnnualRevenueStatistics(params),
    staleTime: 0,
    gcTime: 0,
    enabled: !!params,
  });
};

export const queryGetProductPercentageByCategory = () => {
  return useQuery<any>({
    queryKey: ["queryGetProductPercentageByCategoryAsync"],
    queryFn: () => GetProductPercentageByCategoryAsync(),
    staleTime: 0,
    gcTime: 0,
    enabled: true,
  });
};
export const queryGetStatisticSellerAsync = () => {
  return useQuery<any>({
    queryKey: ["queryGetStatisticSellerAsync"],
    queryFn: () => GetStatisticSellerAsync(),
    staleTime: 0,
    gcTime: 0,
    enabled: true,
  });
};
export const queryGetAnnualRevenueStatisticsOfSeller = (params: any) => {
  return useQuery<any>({
    queryKey: ["queryGetAnnualRevenueStatisticsOfSeller", params],
    queryFn: () => GetAnnualRevenueStatisticsOfSeller(params),
    staleTime: 0,
    gcTime: 0,
    enabled: true,
  });
};
export const queryGetProductPercentageByCategoryOfSeller = () => {
  return useQuery<any>({
    queryKey: ["queryGetProductPercentageByCategoryOfSeller"],
    queryFn: () => GetProductPercentageByCategoryOfSeller(),
    staleTime: 0,
    gcTime: 0,
    enabled: true,
  });
};