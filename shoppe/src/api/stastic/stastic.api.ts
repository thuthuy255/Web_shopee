import { axiosClient } from "../../services/axiosConfig";
import { formatParams } from "../../untils/formatParams";

export const GetStatisticAdminAsync = async () => {
  const url = `/Statistic/getStatisticAdminAsync`;
  return axiosClient.get(url);
};

export const GetAnnualRevenueStatistics = async (params: any) => {
  const query = formatParams(params);
  const url = `/Statistic/getAnnualRevenueStatistics${query}`;
  return axiosClient.get(url);
};

export const GetProductPercentageByCategoryAsync = async () => {
  const url = `/Statistic/getProductPercentageByCategoryAsync`;
  return axiosClient.get(url);
};
export const GetStatisticSellerAsync = async () => {
  const url = `/Statistic/getStatisticSellerAsync`;
  return axiosClient.get(url);
};
export const GetAnnualRevenueStatisticsOfSeller = async (params: any) => {
  const query = formatParams(params);
  const url = `/Statistic/getAnnualRevenueOfSeller${query}`;
  return axiosClient.get(url);
};
export const GetProductPercentageByCategoryOfSeller = async () => {
  const url = `/Statistic/getProductPercentageByCategoryOfSeller`;
  return axiosClient.get(url);
};
export const GetSellerOrderStatistic = async (params: { fromDate?: string; toDate?: string }) => {
  return axiosClient.get("/Statistic/orders", {
    params,
  });
};
// export const ExportSellerOrderStatisticToExcel = async (params: { fromDate?: string; toDate?: string }) => {
//   return axiosClient.get("/Statistic/orders/export", {
//     params,
//     responseType: "blob", // quan trọng để tải file Excel
//   });
// };