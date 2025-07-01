using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.CartItem;
using ProductAPI.DTOs.Common;
using ProductAPI.IServices;
using ProductAPI.Services;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemController : ControllerBase
    {
        private readonly ICartItemService _cartItemServices;
        private readonly IUserPrincipalService _userPrincipal;
        public CartItemController(ICartItemService cartItemServices, IUserPrincipalService userPrincipal)
        {
            _cartItemServices = cartItemServices;
            _userPrincipal = userPrincipal;
        }
        [HttpPost("getUserCartAsync")]
        public async Task<IActionResult> getUserCartAsync(Guid userId)
        {
            var result = await _cartItemServices.GetUserCartAsync(userId);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
        [HttpPost("AddToCart")]
        public async Task<IActionResult> AddToCart([FromBody] CartItemDto dto)
        {
            var userId = _userPrincipal.GetUserId();
            await _cartItemServices.AddToCartAsync(userId.Value, dto);
            return Ok("Added to cart.");
        }
        [HttpPut]
        public async Task<IActionResult> UpdateCartItem([FromBody] CartItemDto dto)
        {
            var userId = _userPrincipal.GetUserId();
            await _cartItemServices.UpdateCartItemAsync(userId.Value, dto);
            return Ok("Cart item updated.");
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> RemoveFromCart(Guid productId)
        {
            var userId = _userPrincipal.GetUserId();
            await _cartItemServices.RemoveFromCartAsync(userId.Value, productId);
            return Ok("Removed from cart.");
        }
    }
}
