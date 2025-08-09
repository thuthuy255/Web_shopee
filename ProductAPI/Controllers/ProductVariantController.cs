using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Product;
using ProductAPI.IServices;
using ProductAPI.Services;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductVariantController : ControllerBase
    {
        private readonly IProductVariantService _variantService;
        private readonly IUserPrincipalService _userPrincipalService;

        public ProductVariantController(IProductVariantService variantService, IUserPrincipalService userPrincipalService)
        {
            _variantService = variantService;
            _userPrincipalService = userPrincipalService;
        }

        // Lấy danh sách biến thể của 1 sản phẩm
        [HttpGet("by-product")]
        public async Task<IActionResult> GetByProduct([FromQuery] Guid productId)
        {
            var result = await _variantService.GetByProductIdAsync(productId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Thêm danh sách biến thể cho sản phẩm
        [HttpPost("add-single")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> AddSingleVariant([FromForm] CreateProductVariantDto variant)
        {
            var sellerId = _userPrincipalService.GetUserId();
            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");

            var result = await _variantService.AddVariantsAsync(new List<CreateProductVariantDto> { variant });
            return result.Success ? Ok(result) : BadRequest(result);
        }


        [HttpDelete("delete")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> DeleteVariant([FromQuery] Guid variantId)
        {
            var sellerId = _userPrincipalService.GetUserId();
            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");

            var result = await _variantService.DeleteVariantAsync(variantId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
