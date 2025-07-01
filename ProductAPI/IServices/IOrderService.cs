using ProductAPI.DTOs.Order;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(Guid userId, OrderCreateDto dto);
        Task<List<Order>> GetUserOrdersAsync(Guid userId);
        Task<Order?> GetOrderDetailAsync(Guid orderId, Guid userId);
    }
}
