using ProductAPI.Core;
using ProductAPI.DTOs.Order;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IOrderService 
    {
        Task<MethodResult<OrderDto>> CreateTemporaryOrderAsync(Guid userId);
        Task<MethodResult<OrderDto>> UpdateOrderInfoAsync(Guid orderId, Guid userId, OrderUpdateDto dto);
        Task<List<OrderDto>> GetUserOrdersAsync(Guid userId);
        Task<OrderDto?> GetOrderDetailAsync(Guid orderId, Guid userId);
    }
}
