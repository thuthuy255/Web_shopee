using ProductAPI.Core;
using ProductAPI.DTOs.Review;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductAPI.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IRepository<Review> _reviewRepo;

        public ReviewService(IRepository<Review> reviewRepo)
        {
            _reviewRepo = reviewRepo;
        }

        public async Task<MethodResult<Review>> CreateAsync(Guid userId, ReviewDto dto)
        {
            var review = new Review
            {
                Id = Guid.NewGuid(),
                ProductId = dto.ProductId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            await _reviewRepo.AddAsync(review);
            return MethodResult<Review>.ResultWithData(review, "Đánh giá đã được thêm.");
        }

        public async Task<MethodResult<Review>> UpdateAsync(Guid userId, ReviewDto dto)
        {
            if (dto.Id == null)
                return MethodResult<Review>.ResultWithError("Id không hợp lệ.");

            var review = await _reviewRepo.GetByIdAsync(dto.Id.Value);
            if (review == null || review.UserId != userId)
                return MethodResult<Review>.ResultWithError("Không tìm thấy hoặc không có quyền.");

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;
            await _reviewRepo.UpdateAsync(review);

            return MethodResult<Review>.ResultWithData(review, "Cập nhật thành công.");
        }

        public async Task<MethodResult<string>> DeleteAsync(Guid userId, Guid reviewId)
        {
            var review = await _reviewRepo.GetByIdAsync(reviewId);
            if (review == null || review.UserId != userId)
                return MethodResult<string>.ResultWithError("Không tìm thấy hoặc không có quyền.");

            await _reviewRepo.DeleteAsync(review);
            return MethodResult<string>.ResultWithData("OK", "Đã xóa đánh giá.");
        }

        public async Task<MethodResult<List<Review>>> GetByProductAsync(Guid productId)
        {
            var list = await _reviewRepo.TableNoTracking
                .Where(r => r.ProductId == productId)
                .Include(r => r.User)
                .ToListAsync();

            return MethodResult<List<Review>>.ResultWithData(list, "Lấy danh sách đánh giá.");
        }

        public async Task<MethodResult<List<Review>>> GetByUserAsync(Guid userId)
        {
            var list = await _reviewRepo.TableNoTracking
                .Where(r => r.UserId == userId)
                .Include(r => r.Product)
                .ToListAsync();

            return MethodResult<List<Review>>.ResultWithData(list, "Lấy đánh giá của bạn.");
        }
    }

}
