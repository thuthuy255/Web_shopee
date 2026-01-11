using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using System.Linq;

namespace ProductAPI.Services
{
    public class PromotionService : BaseService<Promotion>, IPromotionService
    {
        private readonly IRepository<Promotion> _promoRepo;

        public PromotionService(IRepository<Promotion> promoRepo) : base(promoRepo)
        {
            _promoRepo = promoRepo;
        }

        public async Task<MethodResult<Promotion>> CreateAsync(Guid userId, PromotionDto dto)
        {
            // 1. Code bắt buộc
            if (string.IsNullOrWhiteSpace(dto.Code))
                return MethodResult<Promotion>.ResultWithError("Mã khuyến mãi là bắt buộc.");

            if (dto.Code.Length > 50)
                return MethodResult<Promotion>.ResultWithError("Mã khuyến mãi tối đa 50 ký tự.");

            // 2. Code không được trùng
            if (await _promoRepo.TableNoTracking
    .AnyAsync(x => x.Code == dto.Code && x.UserId == userId))
            {
                return MethodResult<Promotion>.ResultWithError("Mã khuyến mãi đã tồn tại.");
            }


            // 3. DiscountPercent
            if (dto.DiscountPercent < 1 || dto.DiscountPercent > 100)
                return MethodResult<Promotion>.ResultWithError("Phần trăm giảm phải từ 1 đến 100.");

            // 4. MinOrderValue
            if (dto.MinOrderValue.HasValue && dto.MinOrderValue < 0)
                return MethodResult<Promotion>.ResultWithError("Giá trị đơn tối thiểu không được âm.");

            // 5. QuantityLimit
            if (dto.QuantityLimit.HasValue && dto.QuantityLimit <= 0)
                return MethodResult<Promotion>.ResultWithError("Số lượng giới hạn phải lớn hơn 0.");

            // 6. Date
            if (dto.EndDate < dto.StartDate)
                return MethodResult<Promotion>.ResultWithError("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");

            // 7. Status hợp lệ
            if (!string.IsNullOrEmpty(dto.Status) &&
                !Enum.TryParse<PromotionStatus>(dto.Status, out _))
            {
                return MethodResult<Promotion>.ResultWithError("Trạng thái khuyến mãi không hợp lệ.");
            }

            // 8. Create entity
            var newPromo = new Promotion
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Code = dto.Code.Trim(),
                Description = dto.Description?.Trim(),
                DiscountPercent = dto.DiscountPercent,
                MinOrderValue = dto.MinOrderValue,
                QuantityLimit = dto.QuantityLimit,
                UsedQuantity = 0,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status ?? PromotionStatus.Active.ToString()
            };

            await _promoRepo.AddAsync(newPromo);

            return MethodResult<Promotion>.ResultWithData(
                newPromo,
                "Tạo mã khuyến mãi thành công."
            );
        }


        public async Task<MethodResult<int>> GetTotalPromotionAsync()
        {
            var total = await _promoRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số khuyến mãi: {total}");
        }

        public async Task<MethodResult<Promotion>> UpdateAsync(Guid userId, PromotionDto dto)
        {
            if (dto.Id == null)
                return MethodResult<Promotion>.ResultWithError("Id không hợp lệ.");

            var promo = await _promoRepo.GetByIdAsync(dto.Id.Value);
            if (promo == null || promo.UserId != userId)
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

            // ✅ Check nếu đã hết hạn => cập nhật trạng thái
            if (promo.EndDate < DateTime.Now && promo.Status == PromotionStatus.Active.ToString())
            {
                promo.Status = PromotionStatus.Expired.ToString();
                await _promoRepo.UpdateAsync(promo);
            }

            return MethodResult<Promotion>.ResultWithData(promo, "Lấy chi tiết thành công.");
        }

        public async Task<MethodResult<List<Promotion>>> GetAllBySellerWithGridAsync(GridInfo grid)
        {
            var query = _promoRepo.TableNoTracking;

            // 🔍 Search
            if (!string.IsNullOrEmpty(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();

                query = query.Where(p =>
                    p.Code.ToLower().Contains(keyword) ||
                    p.Description.ToLower().Contains(keyword) ||
                    p.QuantityLimit.ToString().Contains(keyword) ||
                    p.DiscountPercent.ToString().Contains(keyword) ||
                    p.MinOrderValue.ToString().Contains(keyword)
                );
            }

            // 📌 Tổng bản ghi
            var totalRecord = await query.CountAsync();

            var now = DateTime.Now;

            // 📄 Get data + compute Status
            var result = await query
                .OrderByDescending(p => p.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .Select(p => new Promotion
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Code = p.Code,
                    Description = p.Description,
                    DiscountPercent = p.DiscountPercent,
                    MinOrderValue = p.MinOrderValue,
                    QuantityLimit = p.QuantityLimit,
                    UsedQuantity = p.UsedQuantity,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,

                    // ⭐ LOGIC 3 TRẠNG THÁI
                    Status = p.EndDate < now
                        ? PromotionStatus.Expired.ToString()
                        : p.Status == PromotionStatus.Inactive.ToString()
                            ? PromotionStatus.Inactive.ToString()
                            : PromotionStatus.Active.ToString(),

                    Created = p.Created,
                    CreatedBy = p.CreatedBy,
                    Modified = p.Modified,
                    ModifiedBy = p.ModifiedBy,
                    IsDeleted = p.IsDeleted
                })
                .ToListAsync();

            return MethodResult<List<Promotion>>.ResultWithData(
                result,
                "Lấy danh sách mã khuyến mãi thành công",
                totalRecord
            );
        }




        public async Task<MethodResult<bool>> DeleteAsync(Guid userId, Guid id)
        {
            var promo = await _promoRepo.GetByIdAsync(id);
            if (promo == null || promo.UserId != userId)
                return MethodResult<bool>.ResultWithError("Không tìm thấy hoặc bạn không có quyền xóa mã này.");

            await _promoRepo.DeleteAsync(promo);
            return MethodResult<bool>.ResultWithData(true, "Đã xóa mã khuyến mãi thành công.");
        }
    }
}
