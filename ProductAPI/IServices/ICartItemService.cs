using ProductAPI.Core;
using ProductAPI.DTOs.CartItem;

namespace ProductAPI.IServices
{
    public interface ICartItemService
    {

        Task<MethodResult<List<SellerCartItemsDto>>> GetUserCartAsync(SearchCartItem request);
        Task RemoveSelectedItemsAsync(Guid userId);
        Task RemoveAllItemsAsync(Guid userId);
        Task<MethodResult<CartItemDetailDto>> AddToCartAsync(Guid userId, CartItemDto dto);
        Task<MethodResult<CartItemDetailDto>> UpdateCartItemAsync(Guid userId, CartItemDto dto);
        Task<MethodResult<string>> ToggleCartItemSelectionAsync(Guid userId, Guid productId, bool isSelected, Guid? productVariantId);
        Task<MethodResult<string>> ToggleSelectAllSmartAsync(Guid userId);
        Task<IMethodResult<bool>> RemoveCartItemAsync(Guid cartItemId);
    }
}
