using ProductAPI.Core;
using ProductAPI.DTOs.Order;
using ProductAPI.Models;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using Microsoft.EntityFrameworkCore;
using static ProductAPI.Data.Enums.Enums;

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
                .Where(c => c.UserId == userId)
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

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressId = body.AddressId,
                PromotionCode = body.PromotionCode,
                PaymentMethod = body.PaymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                TotalAmount = totalAmount,
                OrderItems = orderItems,
                Created = DateTime.UtcNow
            };

            await _orderRepo.AddAsync(order);
            await _orderItemRepo.AddRangeAsync(orderItems);
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
                OrderItems = orderItemsDto
            }, "Tạo đơn hàng thành công.");
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
