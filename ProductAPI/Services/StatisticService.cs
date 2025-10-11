using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Statistic;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using static ProductAPI.Data.Enums.Enums;
using OfficeOpenXml;
using ProductAPI.DTOs.Statistic;

namespace ProductAPI.Services
{
    public class StatisticService : IStatisticService
    {
        private readonly IRepository<Product> _productRepos;
        private readonly IRepository<Order> _orderRepos;
        private readonly IRepository<User> _userRepos;
        private readonly IRepository<Category> _cateRepos;
        private readonly IRepository<OrderItem> _orderItemRepos;
        private readonly IRepository<Promotion> _promoRepos;

        public StatisticService(
            IRepository<Product> productRepos,
            IRepository<Order> orderRepos,
            IRepository<User> userRepos,
           IRepository<Category> cateRepos,
           IRepository<OrderItem> orderItemRepos,
           IRepository<Promotion> promoRepos)
        {
            _productRepos = productRepos;
            _orderRepos = orderRepos;
            _userRepos = userRepos;
            _cateRepos = cateRepos;
            _orderItemRepos = orderItemRepos;
            _promoRepos = promoRepos;
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
            var totalVoucher = await _promoRepos.TableNoTracking.CountAsync();
            var result = new StatisticAdminReponse()
            {
                totalCategory = totalCategory,
                totalProducts = totalProducts,
                totalQuantitySeller = totalUser,
                totalRevenue = totalRevenue,
                totalVoucher = totalVoucher
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
        public async Task<MethodResult<StatisticSellerResponse>> GetStatisticSellerAsync(Guid sellerId)
        {
            // Tổng số sản phẩm của người bán
            var totalProducts = await _productRepos.TableNoTracking
                .Where(p => p.SellerId == sellerId)
                .CountAsync();

            // Tổng số danh mục có ít nhất 1 sản phẩm của người bán
            var totalCategory = await _productRepos.TableNoTracking
                .Where(p => p.SellerId == sellerId)
                .Select(p => p.CategoryId)
                .Distinct()
                .CountAsync();

            // Tổng số đơn hàng có sản phẩm của người bán này
            // (giả sử bảng OrderItem có ProductId và OrderId)
            var totalOrder = await (from o in _orderRepos.TableNoTracking
                                    join oi in _orderItemRepos.TableNoTracking on o.Id equals oi.OrderId
                                    join p in _productRepos.TableNoTracking on oi.ProductId equals p.Id
                                    where p.SellerId == sellerId
                                    select o.Id)
                                    .Distinct()
                                    .CountAsync();

            // Tổng doanh thu của người bán (tính từ các đơn đã thanh toán)
            var totalRevenue = await (from o in _orderRepos.TableNoTracking
                                      join oi in _orderItemRepos.TableNoTracking on o.Id equals oi.OrderId
                                      join p in _productRepos.TableNoTracking on oi.ProductId equals p.Id
                                      where p.SellerId == sellerId
                                            && o.PaymentStatus == Data.Enums.Enums.PaymentStatus.Paid
                                      select oi.Quantity * oi.Price)
                                      .SumAsync();

            // Tạo kết quả trả về
            var result = new StatisticSellerResponse()
            {
                TotalProducts = totalProducts,
                TotalCategories = totalCategory,
                TotalOrders = totalOrder,
                TotalRevenue = totalRevenue
            };

            return MethodResult<StatisticSellerResponse>.ResultWithData(result, "Lấy thống kê người bán thành công");
        }

        public async Task<MethodResult<List<MonthlyRevenueDto>>> GetAnnualRevenueOfSeller(Guid sellerId, int year)
        {
            var result = await _orderRepos.TableNoTracking
                  .Where(o => o.PaymentStatus == PaymentStatus.Paid
                              && o.Created.Year == year
                              && o.OrderItems.Any(oi => oi.Product.SellerId == sellerId))
                  .GroupBy(o => o.Created.Month)
                  .Select(g => new MonthlyRevenueDto
                  {
                      Month = g.Key,
                      Revenue = g.Sum(o => o.TotalAmount)
                  })
                  .OrderBy(x => x.Month)
                  .ToListAsync();


            return MethodResult<List<MonthlyRevenueDto>>.ResultWithData(result, "Lấy thông tin thành công");
        }
        public async Task<MethodResult<List<dynamic>>> GetProductPercentageByCategoryOfSeller(Guid sellerId)
        {
            // Tổng số sản phẩm của người bán này
            var totalProducts = await _productRepos.TableNoTracking
                .Where(p => p.SellerId == sellerId)
                .CountAsync();

            // Truy vấn thống kê theo danh mục
            var query = await (from c in _cateRepos.TableNoTracking
                               join p in _productRepos.TableNoTracking
                                   on c.Id equals p.CategoryId into g
                               let productCount = g.Count(x => x.SellerId == sellerId) // chỉ đếm sản phẩm của seller này
                               where productCount > 0
                               orderby productCount descending
                               select new
                               {
                                   CategoryId = c.Id,
                                   CategoryName = c.Name,
                                   ProductCount = productCount,
                                   Percentage = totalProducts == 0 ? 0
                                                : Math.Round((double)productCount * 100 / totalProducts, 2)
                               })
                              .Take(5) // lấy top 5 danh mục có nhiều sản phẩm nhất
                              .ToListAsync<dynamic>();

            return MethodResult<List<dynamic>>.ResultWithData(query, "Thống kê tỷ lệ sản phẩm theo danh mục của người bán thành công");
        }
        //    public async Task<MethodResult<OrderStatisticResponse>> GetOrderStatisticAsync(
        //Guid sellerId, DateTime? fromDate, DateTime? toDate)
        //    {
        //        try
        //        {
        //            // Join Orders -> OrderItems -> Products
        //            var query = from o in _orderRepos.TableNoTracking
        //                        join oi in _orderItemRepos.TableNoTracking
        //                            on o.Id equals oi.OrderId
        //                        join p in _productRepos.TableNoTracking
        //                            on oi.ProductId equals p.Id
        //                        where p.SellerId == sellerId
        //                        select new
        //                        {
        //                            Order = o,
        //                            OrderItem = oi,
        //                            Product = p
        //                        };

        //            if (fromDate.HasValue)
        //                query = query.Where(x => x.Order.Created >= fromDate.Value);

        //            if (toDate.HasValue)
        //                query = query.Where(x => x.Order.Created <= toDate.Value.Date.AddDays(1).AddTicks(-1));

        //            var data = await query.ToListAsync();

        //            if (!data.Any())
        //                return MethodResult<OrderStatisticResponse>.ResultWithError(
        //                    "Không có đơn hàng nào trong khoảng thời gian này.");

        //            // Group theo Order để tổng hợp
        //            var groupedOrders = data.GroupBy(x => x.Order.Id)
        //                .Select(g => new
        //                {
        //                    Order = g.First().Order,
        //                    TotalAmount = g.Sum(x => x.OrderItem.Quantity * x.OrderItem.Price)
        //                })
        //                .ToList();

        //            var summary = new OrderStatisticSummaryDto
        //            {
        //                TotalOrders = groupedOrders.Count,
        //                DeliveredOrders = groupedOrders.Count(o => o.Order.PaymentStatus == PaymentStatus.Paid),
        //                CancelledOrders = groupedOrders.Count(o => o.Order.PaymentStatus == PaymentStatus.Failed),
        //                TotalRevenue = groupedOrders
        //                    .Where(o => o.Order.PaymentStatus == PaymentStatus.Paid)
        //                    .Sum(o => o.TotalAmount)
        //            };

        //            summary.AverageRevenuePerOrder = summary.TotalOrders > 0
        //                ? summary.TotalRevenue / summary.TotalOrders
        //                : 0;

        //            // Tạo danh sách chi tiết
        //            var orderList = groupedOrders.Select(o => new OrderStatisticItemDto
        //            {
        //                OrderCode = o.Order.Id.ToString(),
        //                CreatedDate = o.Order.Created,
        //                Status = o.Order.PaymentStatus.ToString(),
        //                TotalAmount = o.TotalAmount,
        //                PaymentMethod = o.Order.PaymentMethod
        //            }).ToList();

        //            var result = new OrderStatisticResponse
        //            {
        //                Summary = summary,
        //                Orders = orderList
        //            };

        //            return MethodResult<OrderStatisticResponse>.ResultWithData(result);
        //        }
        //        catch (Exception ex)
        //        {
        //            return MethodResult<OrderStatisticResponse>.ResultWithError(ex.Message);
        //        }
        //    }
        private async Task<List<(Order Order, decimal TotalAmount, string UserName)>> GetOrdersGroupedAsync(
     Guid sellerId, DateTime? fromDate, DateTime? toDate)
        {
            var query = from o in _orderRepos.TableNoTracking
                        join oi in _orderItemRepos.TableNoTracking on o.Id equals oi.OrderId
                        join p in _productRepos.TableNoTracking on oi.ProductId equals p.Id
                        join u in _userRepos.TableNoTracking on o.UserId equals u.Id
                        where p.SellerId == sellerId
                        select new { o, oi, u };

            if (fromDate.HasValue)
                query = query.Where(x => x.o.Created >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(x => x.o.Created <= toDate.Value.Date.AddDays(1).AddTicks(-1));

            var data = await query.ToListAsync();

            return data.GroupBy(x => x.o.Id)
                       .Select(g => (
                           Order: g.First().o,
                           TotalAmount: g.Sum(x => x.oi.Quantity * x.oi.Price),
                           UserName: g.First().u.Username
                       ))
                       .ToList();
        }

        public async Task<MethodResult<OrderStatisticResponse>> GetOrderStatisticAsync(
            Guid sellerId, DateTime? fromDate, DateTime? toDate)
        {
            var groupedOrders = await GetOrdersGroupedAsync(sellerId, fromDate, toDate);

            if (!groupedOrders.Any())
                return MethodResult<OrderStatisticResponse>.ResultWithError("Không có đơn hàng");

            var summary = new OrderStatisticSummaryDto
            {
                TotalOrders = groupedOrders.Count,
                DeliveredOrders = groupedOrders.Count(o => o.Order.PaymentStatus == PaymentStatus.Paid),
                CancelledOrders = groupedOrders.Count(o => o.Order.PaymentStatus == PaymentStatus.Failed),
                TotalRevenue = groupedOrders.Where(o => o.Order.PaymentStatus == PaymentStatus.Paid).Sum(o => o.TotalAmount)
            };
            summary.AverageRevenuePerOrder = summary.TotalOrders > 0
                ? summary.TotalRevenue / summary.TotalOrders
                : 0;

            var orderList = groupedOrders.Select(o => new OrderStatisticItemDto
            {
                OrderCode = o.Order.Id.ToString(),
                CreatedDate = o.Order.Created,
                Status = o.Order.PaymentStatus.ToString(),
                TotalAmount = o.TotalAmount,
                PaymentMethod = o.Order.PaymentMethod,
                UserName = o.UserName, // ✅ dùng UserName từ tuple
            }).ToList();


            return MethodResult<OrderStatisticResponse>.ResultWithData(
                new OrderStatisticResponse { Summary = summary, Orders = orderList });
        }

    //    public async Task<byte[]> ExportSellerOrderStatisticToExcelAsync(
    //Guid sellerId, DateTime? fromDate, DateTime? toDate)
    //    {
    //        var statistic = await GetOrderStatisticAsync(sellerId, fromDate, toDate);

    //        if (!statistic.Success || statistic.Data.Orders == null || !statistic.Data.Orders.Any())
    //            return Array.Empty<byte>(); // trả file rỗng hoặc handle FE thông báo "Không có đơn hàng"

    //        using var package = new ExcelPackage();
    //        var ws = package.Workbook.Worksheets.Add("Đơn hàng");

    //        ws.Cells[1, 1].Value = "Mã đơn";
    //        ws.Cells[1, 2].Value = "Ngày tạo";
    //        ws.Cells[1, 3].Value = "Trạng thái";
    //        ws.Cells[1, 4].Value = "Tổng tiền";
    //        ws.Cells[1, 5].Value = "Phương thức thanh toán";

    //        var orders = statistic.Data.Orders;

    //        for (int i = 0; i < orders.Count; i++)
    //        {
    //            var o = orders[i];
    //            ws.Cells[i + 2, 1].Value = o.OrderCode;
    //            ws.Cells[i + 2, 2].Value = o.CreatedDate.ToString("dd/MM/yyyy HH:mm");
    //            ws.Cells[i + 2, 3].Value = o.Status;
    //            ws.Cells[i + 2, 4].Value = o.TotalAmount;
    //            ws.Cells[i + 2, 5].Value = o.PaymentMethod;
    //        }

    //        ws.Cells[ws.Dimension.Address].AutoFitColumns();

    //        return package.GetAsByteArray();
    //    }


        //    public async Task<byte[]> ExportSellerOrderStatisticToExcelAsync(
        //    Guid sellerId, DateTime? fromDate, DateTime? toDate)
        //    {
        //        var statistic = await GetOrderStatisticAsync(sellerId, fromDate, toDate);
        //        if (statistic.Orders == null || !statistic.Orders.Any())
        //            throw new Exception("Không có đơn hàng để xuất Excel.");

        //        using var package = new ExcelPackage();
        //        var ws = package.Workbook.Worksheets.Add("Đơn hàng");

        //        // Header
        //        ws.Cells[1, 1].Value = "Mã đơn";
        //        ws.Cells[1, 2].Value = "Ngày tạo";
        //        ws.Cells[1, 3].Value = "Trạng thái";
        //        ws.Cells[1, 4].Value = "Tổng tiền";
        //        ws.Cells[1, 5].Value = "Phương thức thanh toán";

        //        // Dữ liệu
        //        for (int i = 0; i < statistic.Orders.Count; i++)
        //        {
        //            var o = statistic.Orders[i];
        //            ws.Cells[i + 2, 1].Value = o.OrderCode;
        //            ws.Cells[i + 2, 2].Value = o.CreatedDate.ToString("dd/MM/yyyy HH:mm");
        //            ws.Cells[i + 2, 3].Value = o.Status;
        //            ws.Cells[i + 2, 4].Value = o.TotalAmount;
        //            ws.Cells[i + 2, 5].Value = o.PaymentMethod;
        //        }

        //        ws.Cells[ws.Dimension.Address].AutoFitColumns();
        //        return package.GetAsByteArray();
        //    }
        //}
    }
}

