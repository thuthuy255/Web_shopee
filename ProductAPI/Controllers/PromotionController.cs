using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Common;
using ProductAPI.IServices;
using ProductAPI.Services;

namespace ProductAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionController : ControllerBase
    {
        private readonly IPromotionService _promotionService;
        private readonly IUserPrincipalService _userService;

        public PromotionController(IPromotionService promotionService, IUserPrincipalService userService)
        {
            _promotionService = promotionService;
            _userService = userService;
        }

        
        [HttpPost("createPromotion")]
        [Authorize(Roles = Constant.Constants.ROLE_ADMIN)]
        public async Task<IActionResult> CreatePromotion([FromBody] PromotionDto dto)
        {
            var userId = _userService.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _promotionService.CreateAsync(userId.Value, dto);
            return Ok(result);
        }

        [HttpGet("getTotalPromotion")]
        public async Task<IActionResult> getTotalPromotion()
        {
            var result = await _promotionService.GetTotalPromotionAsync();
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
        [HttpPut("updatePromotion")]
        [Authorize(Roles = Constant.Constants.ROLE_ADMIN)]
        public async Task<IActionResult> UpdatePromotion([FromBody] PromotionDto dto)
        {

            var userId = _userService.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");
            var result = await _promotionService.UpdateAsync(userId.Value, dto);
            return Ok(result);
        }

   
        [HttpGet("getDetailPromotion")]
        public async Task<IActionResult> getDetailById(Guid id)
        {
            var result = await _promotionService.GetByIdAsync(id);
            return Ok(result);
        }


        [HttpPost("getPromotion")]
        public async Task<IActionResult> GetMyPromotions([FromBody] GridInfo grid)
        {
          

            var result = await _promotionService.GetAllBySellerWithGridAsync(grid);
            if (result.Success)
            {
                return Ok(new
                {
                    success= true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.TotalRecord,
                });
            }
            return BadRequest(result);
        }

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = Constant.Constants.ROLE_ADMIN)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = _userService.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");

            var result = await _promotionService.DeleteAsync(userId.Value,id);
            return Ok(result);
        }
    }
}
