using ProductAPI.Core;
using ProductAPI.DTOs.Banner;
using ProductAPI.DTOs.Common;

namespace ProductAPI.IServices
{
    public interface IBannerService
    {
        Task<MethodResult<BannerDTO>> GetByIdAsync(Guid id);
        Task<MethodResult<List<BannerDTO>>> GetAllBanner(GridInfo grid);
        Task<MethodResult<int>> GetTotalBannersAsync();
        Task<MethodResult<BannerDTO>> CreateAsync(CreateBannerDTO dto, Guid adminId);
        Task<MethodResult<BannerDTO>> UpdateAsync(BannerUpdateRequest dto);
        Task<MethodResult<bool>> DeleteAsync(Guid id);
        Task<MethodResult<List<BannerDTO>>> GetBannerByTypeAsync(string type);
    }
}
