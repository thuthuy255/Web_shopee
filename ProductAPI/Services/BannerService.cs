using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Banner;
using ProductAPI.DTOs.Common;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;

namespace ProductAPI.Services
{
    public class BannerService : IBannerService
    {
        private readonly IRepository<Banner> _bannerRepo;
        private readonly CloudinaryService _cloudinaryService;

        public BannerService(IRepository<Banner> bannerRepo, CloudinaryService cloudinaryService)
        {
            _bannerRepo = bannerRepo;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<MethodResult<List<BannerDTO>>> GetAllBanner(GridInfo grid)
        {
            var query = _bannerRepo.TableNoTracking
                .Where(b => b.IsActive);

            if (!string.IsNullOrEmpty(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(keyword) ||
                    b.LinkTo.ToLower().Contains(keyword) ||
                    b.Type.ToLower().Contains(keyword));
            }

            var totalRecord = await query.CountAsync();

            var banners = await query
                .OrderByDescending(b => b.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .ToListAsync();

            var result = banners.Select(b => new BannerDTO
            {
                Id = b.Id,
                Title = b.Title,
                ImageUrl = b.ImageUrl,
                LinkTo = b.LinkTo,
                IsActive = b.IsActive,
                Type = b.Type
            }).ToList();

            return MethodResult<List<BannerDTO>>.ResultWithData(result, "Lấy danh sách banner thành công", totalRecord);
        }

        public async Task<MethodResult<BannerDTO>> GetByIdAsync(Guid id)
        {
            var banner = await _bannerRepo.GetByIdAsync(id);
            if (banner == null)
                return MethodResult<BannerDTO>.ResultWithError("Không tìm thấy banner.");

            var dto = new BannerDTO
            {
                Id = banner.Id,
                Title = banner.Title,
                ImageUrl = banner.ImageUrl,
                LinkTo = banner.LinkTo,
                IsActive = banner.IsActive,
                Type = banner.Type
            };

            return MethodResult<BannerDTO>.ResultWithData(dto, "Lấy banner thành công");
        }
        public async Task<MethodResult<int>> GetTotalBannersAsync()
        {
            var total = await _bannerRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số banner: {total}");
        }
        public async Task<MethodResult<BannerDTO>> CreateAsync(CreateBannerDTO dto, Guid adminId)
        {
            var existed = await _bannerRepo.TableNoTracking
                .AnyAsync(b => b.Type == dto.Type);

            if (existed)
                return MethodResult<BannerDTO>.ResultWithError("Trùng loại Banner");

            string? imageUrl = null;
            if (dto.ImageFile != null)
                imageUrl = await _cloudinaryService.UploadImageAsync(dto.ImageFile);

            var banner = new Banner
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                ImageUrl = imageUrl,
                LinkTo = dto.LinkTo,
                IsActive = dto.IsActive,
                Type = dto.Type,
                Created = DateTime.UtcNow,
                CreatedBy = adminId
            };

            await _bannerRepo.AddAsync(banner);

            var result = new BannerDTO
            {
                Id = banner.Id,
                Title = banner.Title,
                ImageUrl = imageUrl,
                LinkTo = banner.LinkTo,
                IsActive = banner.IsActive,
                Type = banner.Type
            };

            return MethodResult<BannerDTO>.ResultWithData(result, "Tạo banner thành công");
        }


        public async Task<MethodResult<BannerDTO>> UpdateAsync(BannerUpdateRequest dto)
        {
            var banner = await _bannerRepo.GetByIdAsync(dto.Id);
            if (banner == null)
                return MethodResult<BannerDTO>.ResultWithError("Không tìm thấy banner");

            if (dto.ImageFile != null)
            {
                var imageUrl = await _cloudinaryService.UploadImageAsync(dto.ImageFile);
                banner.ImageUrl = imageUrl;
                banner.MarkDirty(nameof(banner.ImageUrl));
            }

            banner.Title = dto.Title;
            banner.LinkTo = dto.LinkTo;
            banner.IsActive = dto.IsActive;
            banner.Type = dto.Type;

            banner.MarkDirty(nameof(banner.Title));
            banner.MarkDirty(nameof(banner.LinkTo));
            banner.MarkDirty(nameof(banner.IsActive));
            banner.MarkDirty(nameof(banner.Type));

            await _bannerRepo.UpdateAsync(banner);

            var resultDto = new BannerDTO
            {
                Id = banner.Id,
                Title = banner.Title,
                ImageUrl = banner.ImageUrl,
                LinkTo = banner.LinkTo,
                IsActive = banner.IsActive,
                Type = banner.Type
            };

            return MethodResult<BannerDTO>.ResultWithData(resultDto, "Cập nhật banner thành công");
        }

        public async Task<MethodResult<bool>> DeleteAsync(Guid id)
        {
            var banner = await _bannerRepo.GetByIdAsync(id);
            if (banner == null)
                return MethodResult<bool>.ResultWithError("Không tìm thấy banner");

            await _bannerRepo.DeleteAsync(banner);
            return MethodResult<bool>.ResultWithData(true, "Xóa banner thành công");
        }

        public async Task<MethodResult<List<BannerDTO>>> GetBannerByTypeAsync(string type)
        {
            if (string.IsNullOrWhiteSpace(type))
                return MethodResult<List<BannerDTO>>.ResultWithError("Type không được để trống");

            var banners = await _bannerRepo.TableNoTracking
                .Where(b => b.IsActive && b.Type.ToLower() == type.ToLower())
                .ToListAsync();

            var result = banners.Select(b => new BannerDTO
            {
                Id = b.Id,
                Title = b.Title,
                ImageUrl = b.ImageUrl,
                LinkTo = b.LinkTo,
                IsActive = b.IsActive,
                Type = b.Type
            }).ToList();

            return MethodResult<List<BannerDTO>>.ResultWithData(result, "Lấy banner theo type thành công");
        }

        public async Task<MethodResult<BannerDTO>> GetDetailBanner(Guid id)
        {
            var banner = await _bannerRepo.GetByIdAsync(id);
            if (banner == null)
                return MethodResult<BannerDTO>.ResultWithError("Không tìm thấy banner");

            var dto = new BannerDTO
            {
                Id = banner.Id,
                Title = banner.Title,
                ImageUrl = banner.ImageUrl,
                LinkTo = banner.LinkTo,
                IsActive = banner.IsActive,
                Type = banner.Type
            };

            return MethodResult<BannerDTO>.ResultWithData(dto);
        }
    }
}
