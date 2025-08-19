using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.Core;
using ProductAPI.DTOs.Category;
using ProductAPI.DTOs.Common;
using ProductAPI.IServices;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpPost("get-all")]
        public async Task<IActionResult> GetAllCategories([FromBody] GridInfo gridInfo)
        {
            var result = await _categoryService.GetAllAsync(gridInfo);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("detail/{id}")]
        [ProducesResponseType(typeof(MethodResult<CategoryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCategoryDetail([FromRoute] Guid id)
        {
            var result = await _categoryService.GetByIdAsync(id);
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.TotalRecord,
                    
              
            });
            }
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ⬇️ Tạo bằng FormData
        [HttpPost("create")]
        public async Task<IActionResult> CreateCategory([FromForm] CreateCategoryDto dto)
        {
            var result = await _categoryService.CreateAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ⬇️ Cập nhật bằng FormData
        [HttpPut("update/{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory([FromRoute] Guid id, [FromForm] UpdateCategoryDto dto)
        {
            var result = await _categoryService.UpdateAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("delete/{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory([FromRoute] Guid id)
        {
            var result = await _categoryService.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
