using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.Order;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IOrderService 
    {
        Task<MethodResult<OrderDto>> CreateOrderAsync(Guid userId, OrderCreateDto body);
        Task<MethodResult<OrderDto>> UpdateOrderInfoAsync(Guid orderId, Guid userId, OrderUpdateDto dto);
        Task<MethodResult<List<OrderDto>>> GetOrdersBySellerAsync(Guid sellerId, GridInfo grid);
        Task<MethodResult<List<OrderDto>>> GetPaidOrdersByUserAsync(Guid userId);
        Task<MethodResult<int>> GetTotalOrderAsync();
        Task<List<OrderDto>> GetUserOrdersAsync(Guid userId);
        Task<OrderDto?> GetOrderDetailAsync(Guid orderId, Guid userId);
    }
}
