using ProductAPI.Core;
using ProductAPI.DTOs.CartItem;
using ProductAPI.DTOs.Common;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface ICartItemService
    {
        Task<MethodResult<List<CartItem>>> GetUserCartAsync(Guid userId);
        Task<MethodResult<CartItem>> AddToCartAsync(Guid userId, CartItemDto dto);
        Task<MethodResult<CartItem>> UpdateCartItemAsync(Guid userId, CartItemDto dto);
        Task<MethodResult<CartItem>> RemoveFromCartAsync(Guid userId, Guid productId);
    }
}
