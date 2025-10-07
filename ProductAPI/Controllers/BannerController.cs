using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.Banner;
using ProductAPI.IServices;

namespace ProductAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BannerController : ControllerBase
    {
        private readonly IBannerService _bannerService;
        private readonly IUserPrincipalService _userService;

        public BannerController(IBannerService bannerService, IUserPrincipalService userService)
        {
            _bannerService = bannerService;
            _userService = userService;
        }

        [HttpPost("getAllBanner")]
        public async Task<IActionResult> GetAll([FromBody] GridInfo grid)
        {
            var result = await _bannerService.GetAllBanner(grid);
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
        [HttpGet("getTotalBanner")]
        public async Task<IActionResult> getTotalBanner()
        {
            var result = await _bannerService.GetTotalBannersAsync();
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
        [HttpPost("createBanner")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateBannerDTO dto)
        {
            var adminId = _userService.GetUserId();
            if (!adminId.HasValue) return Unauthorized("Bạn chưa đăng nhập.");

            var result = await _bannerService.CreateAsync(dto, adminId.Value);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("updateBanner")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromForm] BannerUpdateRequest dto)
        {
            var adminId = _userService.GetUserId();
            if (!adminId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");

            var result = await _bannerService.UpdateAsync(dto);
            return Ok(result);
        }

        [HttpDelete("deleteBanner/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var adminId = _userService.GetUserId();
            if (!adminId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập.");

            var result = await _bannerService.DeleteAsync(id);
            return Ok(result);
        }

        [HttpGet("getDetailBanner/{id}")]
        public async Task<IActionResult> GetDetail(Guid id)
        {
            var result = await _bannerService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet("getByType")]
        public async Task<IActionResult> GetByType([FromQuery] string type)
        {
            var result = await _bannerService.GetBannerByTypeAsync(type);
            return Ok(result);
        }
    }
}
