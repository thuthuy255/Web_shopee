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

        [HttpGet("GetVarianByProduct")]
        public async Task<IActionResult> GetByProduct([FromQuery] Guid productId)
        {
            var result = await _variantService.GetByProductIdAsync(productId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("AddSingleVariant")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> AddSingleVariant([FromForm] CreateProductVariantDto variant)
        {
            var sellerId = _userPrincipalService.GetUserId();
            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");

            var result = await _variantService.AddVariantsAsync(new List<CreateProductVariantDto> { variant });
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpPost("UpdateVariant/{id}")]
        public async Task<IActionResult> UpdateVariant(Guid id, [FromBody] UpdateProductVariantDto dto)
        {
            if (id != dto.Id)
                return BadRequest("Id không khớp");

            var result = await _variantService.UpdateVariantAsync(dto);
            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result);
        }


        
    }
}
