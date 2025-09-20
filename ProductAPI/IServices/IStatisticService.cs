using ProductAPI.Core;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProductAPI.IServices
{
    public interface IStatisticService
    {
        Task<MethodResult<int>> GetTotalProductAsync();

        Task<MethodResult<int>> GetTotalOrderAsync();

        Task<MethodResult<int>> GetTotalUserAsync();

        Task<MethodResult<decimal>> GetTotalRevenueAsync();

        Task<MethodResult<List<object>>> GetProductPercentageByCategoryAsync();
    }
}
