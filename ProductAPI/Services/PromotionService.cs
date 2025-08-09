using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using System.Linq;
using System.Reflection;

namespace ProductAPI.Services
{
    public class PromotionService : BaseService<Promotion>, IPromotionService
    {
        private readonly IRepository<Promotion> _promoRepo;


        public PromotionService(IRepository<Promotion> promoRepo) : base(promoRepo)
        {
            _promoRepo = promoRepo;
        }

        public async Task<MethodResult<Promotion>> CreateAsync(Guid sellerId, PromotionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code))
            {
                return MethodResult<Promotion>.ResultWithError("Mã khuyến mãi (Code) là bắt buộc.");
            }

            var newPromo = new Promotion
            {
                Id = Guid.NewGuid(),
                SellerId = sellerId,
                Code = dto.Code,
                Description = dto.Description,
                DiscountPercent = dto.DiscountPercent,
                MinOrderValue = dto.MinOrderValue,
                QuantityLimit = dto.QuantityLimit,
                UsedQuantity = 0,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Active"
            };

            await _promoRepo.AddAsync(newPromo);
            return MethodResult<Promotion>.ResultWithData(newPromo, "Tạo mã khuyến mãi thành công.");
        }


        public async Task<MethodResult<Promotion>> UpdateAsync(Guid sellerId, PromotionDto dto)
        {
            if (dto.Id == null)
                return MethodResult<Promotion>.ResultWithError("Id không hợp lệ.");

            var promo = await _promoRepo.GetByIdAsync(dto.Id.Value);
            if (promo == null || promo.SellerId != sellerId)
                return MethodResult<Promotion>.ResultWithError("Không tìm thấy hoặc bạn không có quyền sửa mã khuyến mãi này.");

            promo.Code = dto.Code;
            promo.Description = dto.Description;
            promo.DiscountPercent = dto.DiscountPercent;
            promo.MinOrderValue = dto.MinOrderValue;
            promo.QuantityLimit = dto.QuantityLimit;
            promo.StartDate = dto.StartDate;
            promo.EndDate = dto.EndDate;
            promo.Status = dto.Status;
            promo.MarkDirty(nameof(promo.Code));
            promo.MarkDirty(nameof(promo.Description));
            promo.MarkDirty(nameof(promo.DiscountPercent));
            promo.MarkDirty(nameof(promo.MinOrderValue));
            promo.MarkDirty(nameof(promo.QuantityLimit));
            promo.MarkDirty(nameof(promo.StartDate));
            promo.MarkDirty(nameof(promo.EndDate));
            promo.MarkDirty(nameof(promo.Status));
            await _promoRepo.UpdateAsync(promo);
            return MethodResult<Promotion>.ResultWithData(promo, "Cập nhật mã khuyến mãi thành công.");
        }

        public async Task<MethodResult<Promotion>> GetByIdAsync(Guid id)
        {
            var promo = await _promoRepo.TableNoTracking.FirstOrDefaultAsync(p => p.Id == id);
            if (promo == null)
                return MethodResult<Promotion>.ResultWithError("Không tìm thấy mã khuyến mãi.");

            return MethodResult<Promotion>.ResultWithData(promo, "Lấy chi tiết thành công.");
        }

        public async Task<MethodResult<List<Promotion>>> GetAllBySellerWithGridAsync(Guid sellerId, GridInfo grid)
        {
            var query = _promoRepo.TableNoTracking
                .Where(p => p.SellerId == sellerId);

            // Tìm kiếm theo Code hoặc Description nếu có từ khóa
            if (!string.IsNullOrEmpty(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(p =>
                    p.Code.ToLower().Contains(keyword) ||
                    p.Description.ToLower().Contains(keyword));
            }

            // Đếm tổng số bản ghi sau lọc
            var totalRecord = await query.CountAsync();

            // Phân trang và lấy dữ liệu
            var result = await query
                .OrderByDescending(p => p.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .ToListAsync();

            return MethodResult<List<Promotion>>.ResultWithData(result, "Lấy danh sách mã khuyến mãi thành công", totalRecord);
        }


        public async Task<MethodResult<bool>> DeleteAsync(Guid sellerId, Guid id)
        {
            var promo = await _promoRepo.GetByIdAsync(id);
            if (promo == null || promo.SellerId != sellerId)
                return MethodResult<bool>.ResultWithError("Không tìm thấy hoặc bạn không có quyền xóa mã này.");

            await _promoRepo.DeleteAsync(promo);
            return MethodResult<bool>.ResultWithData(true, "Đã xóa mã khuyến mãi thành công.");
        }
    }
}
