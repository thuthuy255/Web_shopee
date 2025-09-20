using ProductAPI.Core;
using ProductAPI.DTOs.Order;
using ProductAPI.Models;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using Microsoft.EntityFrameworkCore;
using static ProductAPI.Data.Enums.Enums;
using ProductAPI.DTOs.Common;

namespace ProductAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<CartItem> _cartRepo;
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<Order> _orderRepo;
        private readonly IRepository<OrderItem> _orderItemRepo;
        private readonly IRepository<Promotion> _promoRepo;

        public OrderService(
            IRepository<CartItem> cartRepo,
            IRepository<Product> productRepo,
            IRepository<Order> orderRepo,
            IRepository<OrderItem> orderItemRepo,
            IRepository<Promotion> promoRepo)
        {
            _cartRepo = cartRepo;
            _productRepo = productRepo;
            _orderRepo = orderRepo;
            _orderItemRepo = orderItemRepo;
            _promoRepo = promoRepo;
        }

        public async Task<MethodResult<OrderDto>> CreateOrderAsync(Guid userId, OrderCreateDto body)
        {
            var cartItems = await _cartRepo.Table
                .Include(c => c.Product)
                .Where(c => c.UserId == userId && body.CartItemIds.Contains(c.Id))
                .ToListAsync();

            if (!cartItems.Any())
                return MethodResult<OrderDto>.ResultWithError("Bạn chưa chọn sản phẩm nào.");

            var orderItems = new List<OrderItem>();
            var orderItemsDto = new List<OrderItemDto>();
            decimal totalAmount = 0m;

            foreach (var cart in cartItems)
            {
                if (cart.Product.StockQuantity < cart.Quantity)
                    return MethodResult<OrderDto>.ResultWithError(
                        $"Sản phẩm '{cart.Product.ProductName}' không đủ hàng.");

                totalAmount += cart.Quantity * cart.Product.Price;

                var item = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = cart.ProductId,
                    Quantity = cart.Quantity,
                    Price = cart.Product.Price
                };
                orderItems.Add(item);

                orderItemsDto.Add(new OrderItemDto
                {
                    Id = item.Id,
                    ProductId = cart.ProductId,
                    ProductName = cart.Product.ProductName,
                    ProductImage = cart.Product.Thumbnail ?? "",
                    Quantity = cart.Quantity,
                    Price = cart.Product.Price
                });

                cart.Product.StockQuantity -= cart.Quantity;
            }

            //// 🟢 Áp dụng khuyến mãi (nếu có)
            //if (!string.IsNullOrEmpty(body.PromotionCode))
            //{
            //    var promotion = await _promoRepo.Table
            //        .FirstOrDefaultAsync(p => p.Code == body.PromotionCode);

            //    if (promotion != null)
            //    {
            //        if (promotion.DiscountAmount > 0)
            //            totalAmount -= promotion.DiscountAmount;
            //        else if (promotion.DiscountPercent > 0)
            //            totalAmount -= (totalAmount * promotion.DiscountPercent) / 100;

            //        if (totalAmount < 0) totalAmount = 0;
            //    }
            //}

            var random = new Random();
            var txnRef = DateTime.Now.ToString("yyyyMMddHHmmss") + random.Next(1000, 9999);

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressId = body.AddressId,
                PromotionCode = body.PromotionCode,
                PaymentMethod = body.PaymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                TotalAmount = totalAmount,   // ✅ chỉ BE tính
                TxnRef = txnRef,
                OrderItems = orderItems,
                Created = DateTime.UtcNow
            };

            await _orderRepo.AddAsync(order);
            await _cartRepo.DeleteRangeAsync(cartItems);

            return MethodResult<OrderDto>.ResultWithData(new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                AddressId = order.AddressId,
                PromotionCode = order.PromotionCode,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                TotalAmount = order.TotalAmount,
                OrderItems = orderItemsDto,
                TxnRef = order.TxnRef
            }, "Tạo đơn hàng thành công.");
        }
        public async Task<MethodResult<int>> GetTotalOrderAsync()
        {
            var total = await _orderRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số đơn hàng: {total}");
        }


        public async Task<MethodResult<List<OrderDto>>> GetPaidOrdersByUserAsync(Guid userId)
        {
            var orders = await _orderRepo.TableNoTracking
                .Where(o => o.UserId == userId && o.PaymentStatus == PaymentStatus.Paid)
                .Include(o => o.OrderItems) // load OrderItems
                    .ThenInclude(oi => oi.Product) // load Product cho mỗi OrderItem
                .OrderByDescending(o => o.Created)
                .ToListAsync();

            var orderDtos = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                UserName = o.User?.Username ?? "", // nếu User có null
                PaymentStatus = o.PaymentStatus,
                Created = o.Created,
                TotalAmount = o.TotalAmount,
                AddressId = o.AddressId,
                AddressDetail = o.Address?.AddressDetail,
                OrderItems = (o.OrderItems ?? new List<OrderItem>())
                    .Where(oi => oi.Product != null) // lọc các item có Product
                    .Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product!.ProductName,
                        ProductImage = oi.Product!.Thumbnail,
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    })
                    .ToList()
            }).ToList();

            return MethodResult<List<OrderDto>>.ResultWithData(orderDtos, "Lấy danh sách đơn đã thanh toán thành công");
        }


        // Cập nhật thông tin Order theo DTO
        public async Task<MethodResult<OrderDto>> UpdateOrderInfoAsync(Guid orderId, Guid userId, OrderUpdateDto dto)
        {
            var order = await _orderRepo.Table
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
                return MethodResult<OrderDto>.ResultWithError("Đơn hàng không tồn tại.");

            // Cập nhật địa chỉ
            if (dto.AddressId.HasValue)
                order.AddressId = dto.AddressId;

            // Tính tổng tiền trước giảm giá
            decimal totalBeforeDiscount = order.OrderItems.Sum(i => i.Price * i.Quantity);
            decimal discountAmount = 0m;

            // Xử lý voucher
            if (!string.IsNullOrEmpty(dto.PromotionCode))
            {
                var promo = await _promoRepo.Table
                    .FirstOrDefaultAsync(p => p.Code == dto.PromotionCode && p.Status == "Active");

                if (promo == null)
                    return MethodResult<OrderDto>.ResultWithError("Voucher không hợp lệ hoặc đã hết hạn.");

                discountAmount = totalBeforeDiscount * (promo.DiscountPercent / 100m);

                promo.UsedQuantity += 1;
                if (promo.QuantityLimit.HasValue && promo.UsedQuantity >= promo.QuantityLimit)
                    promo.Status = "Inactive";

                await _promoRepo.UpdateAsync(promo);

                order.PromotionCode = dto.PromotionCode;
            }

            // Cập nhật tổng tiền
            order.TotalAmount = totalBeforeDiscount - discountAmount;

            await _orderRepo.UpdateAsync(order);

            // Mapping sang DTO
            var orderDto = new OrderDto
            {
                Id = order.Id,
                TotalAmount = order.TotalAmount,
                PaymentStatus = order.PaymentStatus,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.ProductName ?? "",
                    ProductImage = oi.Product?.Thumbnail ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };

            return MethodResult<OrderDto>.ResultWithData(orderDto, "Cập nhật thông tin đơn hàng thành công.");
        }

        // Lấy danh sách Order của user
        public async Task<List<OrderDto>> GetUserOrdersAsync(Guid userId)
        {
            var orders = await _orderRepo.TableNoTracking
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.Created)
                .ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                PaymentStatus = o.PaymentStatus,
                OrderItems = o.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.ProductName ?? "",
                    ProductImage = oi.Product?.Thumbnail ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();
        }
        public async Task<MethodResult<List<OrderDto>>> GetOrdersBySellerAsync(Guid sellerId, GridInfo grid)
        {
            var query = _orderRepo.Table
                .Include(o => o.Address) // ✅ join sang Address
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o=>o.User)
                .Where(o => o.OrderItems.Any(oi => oi.Product.SellerId == sellerId));

            // Tổng số bản ghi (trước phân trang)
            var total = await query.CountAsync();

            // Áp dụng sort + phân trang + mapping DTO
            var data = await query
                .OrderByDescending(o => o.Created) // sort theo ngày tạo
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName =o.User.Username,
                    Created= o.Created,
                    AddressId = o.AddressId,
                    AddressDetail = o.Address != null ? o.Address.AddressDetail : null, // ✅ lấy từ Address
                    TotalAmount = o.TotalAmount,
                    PaymentStatus = o.PaymentStatus,
                    PromotionCode = o.PromotionCode,
                    PaymentMethod = o.PaymentMethod,
                    TxnRef = o.TxnRef,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product.ProductName,
                        ProductImage = oi.Product.Thumbnail ?? "",
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                })
                .ToListAsync();

            return MethodResult<List<OrderDto>>.ResultWithData(data, "Lấy đơn hàng thành công", total);
        }



        // Lấy chi tiết Order
        public async Task<OrderDto?> GetOrderDetailAsync(Guid orderId, Guid userId)
        {
            var order = await _orderRepo.TableNoTracking
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null) return null;

            return new OrderDto
            {
                Id = order.Id,
                TotalAmount = order.TotalAmount,
                PaymentStatus = order.PaymentStatus,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.ProductName ?? "",
                    ProductImage = oi.Product?.Thumbnail ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }
    }
}
