using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.Product;
using ProductAPI.IServices;
using ProductAPI.Services;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productServices;
        private readonly IUserPrincipalService _userPrincipalService;

        public ProductController(IProductService productServices, IUserPrincipalService userPrincipalService)
        {
            _productServices = productServices;
            _userPrincipalService = userPrincipalService;
        }

        [HttpPost("getAllProduct")]
        public async Task<IActionResult> GetAllProduct([FromBody] GridInfo search)
        {
            var result = await _productServices.FilterProductAsync(search);
            if (result.Success) {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.TotalRecord,
                });
            }
            return BadRequest(result);
        }
        [HttpPost("by-category/{categoryId}")]
        public async Task<IActionResult> GetProductsByCategory(Guid categoryId, [FromBody] GridInfo grid)
        {
            var result = await _productServices.GetProductsByCategoryAsync(categoryId, grid);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpGet("getDetailProduct")]
        public async Task<IActionResult> GetDetailProduct([FromQuery] Guid productId)
        {
            var result = await _productServices.GetByIdAsync(productId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpPost("getMyProducts")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> GetMyProducts([FromBody] GridInfo grid)
        {
            var sellerId = _userPrincipalService.GetUserId();

            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập");

            var result = await _productServices.FilterProductBySellerAsync(sellerId.Value, grid);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("insertProduct")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> InsertProduct([FromForm] ProductFormDataDto dto)
        {
            var sellerId = _userPrincipalService.GetUserId();

            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");
            var result = await _productServices.InsertProductFromFormAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("updateProduct")]
        public async Task<IActionResult> UpdateProduct([FromQuery] Guid productId, [FromForm] ProductFormDataDto dto)
        {
            var sellerId = _userPrincipalService.GetUserId();

            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");
            var result = await _productServices.UpdateProductFromFormAsync(productId, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("deleteProduct")]
        [Authorize(Roles = "Seller")]

        public async Task<IActionResult> DeleteProduct([FromQuery] Guid productId)
        {
            var sellerId = _userPrincipalService.GetUserId();

            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");
            var result = await _productServices.DeleteProductAsync(productId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
