using ProductAPI.Core;
using ProductAPI.DTOs.Statistic;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProductAPI.IServices
{
    public interface IStatisticService
    {
        Task<MethodResult<StatisticAdminReponse>> GetStatisticAdminAsync();
        Task<MethodResult<List<MonthlyRevenueDto>>> GetAnnualRevenueStatistics(int year);
        Task<MethodResult<List<dynamic>>> GetProductPercentageByCategoryAsync();
        Task<MethodResult<List<MonthlyRevenueDto>>> GetAnnualRevenueOfSeller(Guid sellerId, int year);
        Task<MethodResult<List<dynamic>>> GetProductPercentageByCategoryOfSeller(Guid sellerId);
        Task<MethodResult<StatisticSellerResponse>> GetStatisticSellerAsync(Guid sellerId);
        Task<MethodResult<OrderStatisticResponse>> GetOrderStatisticAsync(
            Guid sellerId,
            DateTime? fromDate,
            DateTime? toDate);

        // Thêm hàm xuất Excel
        //Task<byte[]> ExportSellerOrderStatisticToExcelAsync(
        //    Guid sellerId,
        //    DateTime? fromDate,
        //    DateTime? toDate);
    }
}
