using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductAPI.DTOs.CartItem;
using ProductAPI.IRepository;
using ProductAPI.IServices;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemController : ControllerBase
    {
        private readonly ICartItemService _cartItemServices;
        private readonly IUserPrincipalService _userPrincipal;
        private readonly IRepository<CartItem> _cartItemRepos;

        public CartItemController(ICartItemService cartItemServices, IUserPrincipalService userPrincipal, IRepository<CartItem> cartItemRepos)
        {
            _cartItemServices = cartItemServices;
            _userPrincipal = userPrincipal;
            _cartItemRepos = cartItemRepos;
        }

        [HttpPost("GetUserCartAsync")]
        public async Task<IActionResult> GetUserCartAsync(SearchCartItem request)
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _cartItemServices.GetUserCartAsync(request);
            if (result.Success)
            {
                var totalCartItem = await _cartItemRepos.TableNoTracking
               .Where(p => p.UserId == userId)
               .CountAsync();

                    return Ok(new
                    {
                        result.Data,
                        result.Message,
                        result.TotalRecord,
                        TotalCartItem = totalCartItem
                    });
            }
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] CartItemDto dto)
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _cartItemServices.AddToCartAsync(userId.Value, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] CartItemDto dto)
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _cartItemServices.UpdateCartItemAsync(userId.Value, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("deleteAllItem")]
        public async Task<IActionResult> RemoveAllItems()
        {
            var userId = _userPrincipal.GetUserId();
            await _cartItemServices.RemoveAllItemsAsync(userId.Value);
            return Ok("Đã xoá tất cả các sản phẩm đã chọn khỏi giỏ hàng.");
        }

        [HttpPost("toggle-selection")]
        public async Task<IActionResult> ToggleCartItemSelection([FromQuery] Guid productId, [FromQuery] bool isSelected)
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _cartItemServices.ToggleCartItemSelectionAsync(userId.Value, productId, isSelected);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("toggle-select-all")]
        public async Task<IActionResult> ToggleSelectAllSmart()
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _cartItemServices.ToggleSelectAllSmartAsync(userId.Value);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("selected")]
        public async Task<IActionResult> GetSelectedCartItems(SearchCartItem request)
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _cartItemServices.GetUserCartAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("selected")]
        public async Task<IActionResult> RemoveSelectedItems()
        {
            var userId = _userPrincipal.GetUserId();
            await _cartItemServices.RemoveSelectedItemsAsync(userId.Value);
            return Ok("Đã xoá các sản phẩm đã chọn khỏi giỏ hàng.");
        }
    }
}
