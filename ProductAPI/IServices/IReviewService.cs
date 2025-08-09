using ProductAPI.Core;
using ProductAPI.DTOs.Review;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IReviewService
    {
        Task<MethodResult<Review>> CreateAsync(Guid userId, ReviewDto dto);
        Task<MethodResult<Review>> UpdateAsync(Guid userId, ReviewDto dto);
        Task<MethodResult<string>> DeleteAsync(Guid userId, Guid reviewId);
        Task<MethodResult<List<Review>>> GetByProductAsync(Guid productId);
        Task<MethodResult<List<Review>>> GetByUserAsync(Guid userId);
    }
}
