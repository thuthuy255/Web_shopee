using ProductAPI.Core;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductAPI.Services
{
    public class StatisticService : IStatisticService
    {
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<Order> _orderRepo;
        private readonly IRepository<User> _userRepo;
        private readonly IRepository<Category> _cateRepo;

        public StatisticService(
            IRepository<Product> productRepo,
            IRepository<Order> orderRepo,
            IRepository<User> userRepo,
           IRepository<Category> cateRepo)
        {
            _productRepo = productRepo;
            _orderRepo = orderRepo;
            _userRepo = userRepo;
            _cateRepo = cateRepo;
        }

        public async Task<MethodResult<int>> GetTotalProductAsync()
        {
            var total = await _productRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số sản phẩm: {total}");
        }

        public async Task<MethodResult<int>> GetTotalUserAsync()
        {
            var total = await _userRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số người dùng: {total}");
        }

        public async Task<MethodResult<int>> GetTotalOrderAsync()
        {
            var total = await _orderRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số đơn hàng: {total}");
        }

        public async Task<MethodResult<decimal>> GetTotalRevenueAsync()
        {
            var total = await _orderRepo.TableNoTracking
                .Where(o => o.PaymentStatus == Data.Enums.Enums.PaymentStatus.Paid)
                .SumAsync(o => o.TotalAmount);

            return MethodResult<decimal>.ResultWithData(total, $"Tổng doanh thu: {total:N0} VNĐ");
        }
        public async Task<MethodResult<List<dynamic>>> GetProductPercentageByCategoryAsync()
        {
            var totalProducts = await _productRepo.TableNoTracking.CountAsync();

            var query = await (from c in _cateRepo.TableNoTracking
                               join p in _productRepo.TableNoTracking
                                   on c.Id equals p.CategoryId into g
                               let productCount = g.Count()
                               where productCount > 0 // chỉ lấy danh mục có sản phẩm
                               select new
                               {
                                   CategoryId = c.Id,
                                   CategoryName = c.Name,
                                   ProductCount = g.Count(),
                                   Percentage = totalProducts == 0 ? 0
                                               : (double)g.Count() * 100 / totalProducts
                               }).ToListAsync<dynamic>();
            if( query.Count() > 0)
            {

            }

            return MethodResult<List<dynamic>>.ResultWithData(query, "Thống kê tỷ lệ sản phẩm theo danh mục thành công");
        }


    }
}
