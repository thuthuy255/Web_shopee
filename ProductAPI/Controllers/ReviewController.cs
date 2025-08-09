using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Review;
using ProductAPI.IServices;

namespace ProductAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly IUserPrincipalService _userService;

        public ReviewController(IReviewService reviewService, IUserPrincipalService userService)
        {
            _reviewService = reviewService;
            _userService = userService;
        }

        // ✅ Tạo đánh giá mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReviewDto dto)
        {
            var userId = _userService.GetUserId();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            var result = await _reviewService.CreateAsync(userId.Value, dto);
            return Ok(result);
        }

        // ✅ Cập nhật đánh giá
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ReviewDto dto)
        {
            var userId = _userService.GetUserId();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            var result = await _reviewService.UpdateAsync(userId.Value, dto);
            return Ok(result);
        }

        // ✅ Xóa đánh giá
        [HttpDelete("{reviewId:guid}")]
        public async Task<IActionResult> Delete(Guid reviewId)
        {
            var userId = _userService.GetUserId();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            var result = await _reviewService.DeleteAsync(userId.Value, reviewId);
            return Ok(result);
        }

        // ✅ Lấy danh sách đánh giá theo sản phẩm
        [HttpGet("product/{productId:guid}")]
        public async Task<IActionResult> GetByProduct(Guid productId)
        {
            var result = await _reviewService.GetByProductAsync(productId);
            return Ok(result);
        }

        // ✅ Lấy danh sách đánh giá theo người dùng
        [HttpGet("user")]
        public async Task<IActionResult> GetByUser()
        {
            var userId = _userService.GetUserId();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            var result = await _reviewService.GetByUserAsync(userId.Value);
            return Ok(result);
        }
    }
}
