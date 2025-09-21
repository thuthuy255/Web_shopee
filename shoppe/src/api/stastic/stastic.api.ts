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
