using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Statistic;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using static ProductAPI.Data.Enums.Enums;

namespace ProductAPI.Services
{
    public class StatisticService : IStatisticService
    {
        private readonly IRepository<Product> _productRepos;
        private readonly IRepository<Order> _orderRepos;
        private readonly IRepository<User> _userRepos;
        private readonly IRepository<Category> _cateRepos;

        public StatisticService(
            IRepository<Product> productRepos,
            IRepository<Order> orderRepos,
            IRepository<User> userRepos,
           IRepository<Category> cateRepos)
        {
            _productRepos = productRepos;
            _orderRepos = orderRepos;
            _userRepos = userRepos;
            _cateRepos = cateRepos;
        }

        public async Task<MethodResult<StatisticAdminReponse>> GetStatisticAdminAsync()
        {
            var totalProducts = await _productRepos.TableNoTracking.CountAsync();
            var totalCategory = await _cateRepos.TableNoTracking.CountAsync();
            var totalOrder = await _orderRepos.TableNoTracking.CountAsync();
            var totalRevenue = await _orderRepos.TableNoTracking
               .Where(o => o.PaymentStatus == Data.Enums.Enums.PaymentStatus.Paid)
               .SumAsync(o => o.TotalAmount);
            var totalUser = await _userRepos.TableNoTracking.CountAsync();
            var result = new StatisticAdminReponse()
            {
                totalCategory = totalCategory,
                totalProducts = totalProducts,
                totalQuantitySeller = totalUser,
                totalRevenue = totalRevenue
            };
            return MethodResult<StatisticAdminReponse>.ResultWithData(result, "Lấy thông tin thành công");
        }

        public async Task<MethodResult<List<MonthlyRevenueDto>>> GetAnnualRevenueStatistics(int year)
        {
            var result = await _orderRepos.TableNoTracking
                        .Where(o => o.PaymentStatus == PaymentStatus.Paid && o.Created.Year == year)
                        .GroupBy(o => o.Created.Month)
                        .Select(g => new MonthlyRevenueDto
                        {
                            Month = g.Key,
                            Revenue = g.Sum(x => x.TotalAmount)
                        })
                        .OrderBy(x => x.Month)
                        .ToListAsync();
            return MethodResult<List<MonthlyRevenueDto>>.ResultWithData(result, "Lấy thông tin thành công");
        }

        public async Task<MethodResult<List<dynamic>>> GetProductPercentageByCategoryAsync()
        {
            var totalProducts = await _productRepos.TableNoTracking.CountAsync();

            var query = await (from c in _cateRepos.TableNoTracking
                               join p in _productRepos.TableNoTracking
                                   on c.Id equals p.CategoryId into g
                               let productCount = g.Count()
                               where productCount > 0 // chỉ lấy danh mục có sản phẩm
                               orderby productCount descending // sắp xếp giảm dần theo số lượng
                               select new
                               {
                                   CategoryId = c.Id,
                                   CategoryName = c.Name,
                                   ProductCount = productCount,
                                   Percentage = totalProducts == 0 ? 0
                                                : Math.Round((double)productCount * 100 / totalProducts, 2)
                               })
                               .Take(5) // lấy top 10
                               .ToListAsync<dynamic>();

            return MethodResult<List<dynamic>>.ResultWithData(query, "Thống kê tỷ lệ sản phẩm theo danh mục thành công");

        }
    }
}
