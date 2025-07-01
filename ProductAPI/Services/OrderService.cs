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

        public OrderService(IRepository<CartItem> cartRepo,
                            IRepository<Product> productRepo,
                            IRepository<Order> orderRepo,
                            IRepository<OrderItem> orderItemRepo)
        {
            _cartRepo = cartRepo;
            _productRepo = productRepo;
            _orderRepo = orderRepo;
            _orderItemRepo = orderItemRepo;
        }

        public async Task<Order> CreateOrderAsync(Guid userId, OrderCreateDto dto)
        {
            var cartItems = await _cartRepo.Table
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any()) throw new Exception("Giỏ hàng trống.");

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressId = dto.AddressId,
                TotalAmount = 0,
                Status = "Pending"
            };

            foreach (var cart in cartItems)
            {
                if (cart.Product.StockQuantity < cart.Quantity)
                    throw new Exception($"Sản phẩm {cart.Product.ProductName} không đủ hàng.");

                order.OrderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = cart.ProductId,
                    Quantity = cart.Quantity,
                    Price = cart.Product.Price
                });

                // Trừ hàng tồn kho
                cart.Product.StockQuantity -= cart.Quantity;

                // Cộng tổng
                order.TotalAmount += cart.Quantity * cart.Product.Price;
            }

            await _orderRepo.AddAsync(order);
            await _orderItemRepo.AddRangeAsync(order.OrderItems.ToList());
            await _productRepo.UpdateRangeAsync(cartItems.Select(c => c.Product).ToList());

            // Xoá giỏ hàng
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
