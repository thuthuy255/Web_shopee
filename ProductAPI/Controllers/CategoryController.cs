using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.Core;
using ProductAPI.DTOs.Category;
using ProductAPI.DTOs.Common;
using ProductAPI.IServices;
using ProductAPI.Services;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IUserPrincipalService _userPrincipalService;


        public CategoryController(ICategoryService categoryService, IUserPrincipalService userPrincipalService)
        {
            _categoryService = categoryService;
            _userPrincipalService = userPrincipalService;
        }

        [HttpPost("get-all")]
        public async Task<IActionResult> GetAllCategories([FromBody] GridInfo gridInfo)
        {
            var result = await _categoryService.GetAllAsync(gridInfo);
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
            return BadRequest(result);
        }
        [HttpGet("getTotalCategory")]
        public async Task<IActionResult> getTotalCategory()
        {
            var result = await _categoryService.GetTotalCategoryAsync();
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
            return BadRequest(result);
        }
        [Authorize(Roles = Constant.Constants.ROLE_SELLER)]
        [HttpPost("GetCategoryOfSeller")]
        public async Task<IActionResult> GetCategoryOfSeller([FromBody] GridInfo gridInfo)
        {
            var sellerId = _userPrincipalService.GetUserId();
            var result = await _categoryService.GetBySellerAsync(gridInfo);
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
            return BadRequest(result);
        }

        [HttpGet("detail/{id}")]
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
            return BadRequest(result);
        }
        [Authorize (Roles =Constant.Constants.ROLE_SELLER)]
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
            return Ok(result) ;
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
