using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.Product;
using ProductAPI.IServices;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productServices;

        public ProductController(IProductService productServices)
        {
            _productServices = productServices;
        }

        // Lấy danh sách sản phẩm có phân trang
        [HttpPost("getAllProduct")]
        public async Task<IActionResult> GetAllProduct([FromBody] GridInfo search)
        {
            var result = await _productServices.FilterProductAsync(search);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Lấy chi tiết sản phẩm theo ID
        [HttpGet("getDetailProduct")]
        public async Task<IActionResult> GetDetailProduct([FromQuery] Guid productId)
        {
            var result = await _productServices.GetByIdAsync(productId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Thêm sản phẩm mới
        [HttpPost("insertProduct")]
        public async Task<IActionResult> InsertProduct([FromBody] ProductResultDto dto)
        {
            var result = await _productServices.InsertProductAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Cập nhật sản phẩm
        [HttpPut("updateProduct")]
        public async Task<IActionResult> UpdateProduct([FromQuery] Guid productId, [FromBody] ProductResultDto dto)
        {
            var result = await _productServices.UpdateProductAsync(productId, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // Xóa sản phẩm
        [HttpDelete("deleteProduct")]
        public async Task<IActionResult> DeleteProduct([FromQuery] Guid productId)
        {
            var result = await _productServices.DeleteProductAsync(productId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
