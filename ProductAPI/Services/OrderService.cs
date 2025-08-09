using ProductAPI.DTOs.Order;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<CartItem> _cartRepo;
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<Order> _orderRepo;
        private readonly IRepository<OrderItem> _orderItemRepo;
        private readonly IRepository<Promotion> _promoRepo;

        public OrderService(IRepository<CartItem> cartRepo,
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

        public async Task<Order> CreateOrderAsync(Guid userId, OrderCreateDto dto)
        {
            var cartItems = await _cartRepo.Table
                .Include(c => c.Product)
                .Where(c => c.UserId == userId && c.IsSelected)
                .ToListAsync();

            if (!cartItems.Any())
                throw new Exception("Bạn chưa chọn sản phẩm nào để đặt hàng.");

            decimal totalBeforeDiscount = 0m;

            foreach (var cart in cartItems)
            {
                if (cart.Product.StockQuantity < cart.Quantity)
                    throw new Exception($"Sản phẩm '{cart.Product.ProductName}' không đủ hàng.");

                totalBeforeDiscount += cart.Quantity * cart.Product.Price;
            }

            // Kiểm tra khuyến mãi nếu có
            decimal discountAmount = 0m;
            Promotion? promotion = null;

            if (!string.IsNullOrEmpty(dto.PromotionCode))
            {
                promotion = await _promoRepo.Table
                    .FirstOrDefaultAsync(p =>
                        p.Code == dto.PromotionCode &&
                        p.Status == "Active" &&
                        DateTime.UtcNow >= p.StartDate &&
                        DateTime.UtcNow <= p.EndDate &&
                        (p.MinOrderValue == null || totalBeforeDiscount >= p.MinOrderValue) &&
                        (p.QuantityLimit == null || p.UsedQuantity < p.QuantityLimit)
                    );

                if (promotion == null)
                    throw new Exception("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");

                discountAmount = totalBeforeDiscount * (promotion.DiscountPercent / 100m);
                promotion.UsedQuantity += 1;

                if (promotion.QuantityLimit.HasValue && promotion.UsedQuantity >= promotion.QuantityLimit)
                    promotion.Status = "Inactive";
            }

            // Tạo đơn hàng
            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressId = dto.AddressId,
                TotalAmount = totalBeforeDiscount - discountAmount,
                Status = "Pending",
                OrderItems = new List<OrderItem>()
            };

            foreach (var cart in cartItems)
            {
                order.OrderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = cart.ProductId,
                    Quantity = cart.Quantity,
                    Price = cart.Product.Price
                });

                cart.Product.StockQuantity -= cart.Quantity;
            }

            await _orderRepo.AddAsync(order);
            await _orderItemRepo.AddRangeAsync(order.OrderItems.ToList());
            await _productRepo.UpdateRangeAsync(cartItems.Select(c => c.Product).ToList());
            if (promotion != null)
                await _promoRepo.UpdateAsync(promotion);

            await _cartRepo.DeleteRangeAsync(cartItems);

            return order;
        }

        public async Task<List<Order>> GetUserOrdersAsync(Guid userId)
        {
            return await _orderRepo
                .TableNoTracking
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.Created)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderDetailAsync(Guid orderId, Guid userId)
        {
            return await _orderRepo
                .TableNoTracking
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);
        }
    }
}
