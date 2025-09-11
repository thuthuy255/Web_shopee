using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IPromotionService
    {
        Task<MethodResult<Promotion>> CreateAsync(Guid sellerId, PromotionDto dto);
        Task<MethodResult<Promotion>> UpdateAsync(Guid sellerId, PromotionDto dto);
        Task<MethodResult<Promotion>> GetByIdAsync(Guid id);
        Task<MethodResult<List<Promotion>>> GetAllBySellerWithGridAsync( GridInfo grid);
        Task<MethodResult<bool>> DeleteAsync(Guid sellerId, Guid id);
    }
}
