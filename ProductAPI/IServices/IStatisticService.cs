using ProductAPI.Core;
using ProductAPI.DTOs.Statistic;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProductAPI.IServices
{
    public interface IStatisticService
    {
        Task<MethodResult<StatisticAdminReponse>> GetStatisticAdminAsync();
        Task<MethodResult<List<MonthlyRevenueDto>>> GetAnnualRevenueStatistics(int year);
        Task<MethodResult<List<dynamic>>> GetProductPercentageByCategoryAsync();
    }
}
