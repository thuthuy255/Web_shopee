using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Category;
using ProductAPI.DTOs.Common;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;

namespace ProductAPI.Services
{
    public class CategoryService : BaseService<Category>, ICategoryService
    {
        private readonly IRepository<Category> _categoryRepo;
        private readonly IUserPrincipalService _userPrincipalService;
        private readonly CloudinaryService _cloudinaryService;

        public CategoryService(
            IRepository<Category> categoryRepo,
            IUserPrincipalService userPrincipalService,
            CloudinaryService cloudinaryService) : base(categoryRepo)
        {
            _categoryRepo = categoryRepo;
            _userPrincipalService = userPrincipalService;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<MethodResult<List<CategoryDto>>> GetAllAsync(GridInfo grid)
        {
            IQueryable<Category> query = _categoryRepo.TableNoTracking
                .Where(c => !c.IsDeleted)
                .Include(c => c.Seller);

            // Tìm kiếm
            if (!string.IsNullOrWhiteSpace(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(keyword) ||
                    (c.Description != null && c.Description.ToLower().Contains(keyword) ||
                    c.Seller.Username.ToLower().Contains(keyword)
                    )
                );
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(c => c.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .ToListAsync();

            var result = data.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ParentCategoryId = c.ParentCategoryId,
                SellerName = c.Seller != null ? c.Seller.Username : null
            }).ToList();

            return MethodResult<List<CategoryDto>>.ResultWithData(
                result,
                "Lấy danh sách danh mục thành công",
                total
            );
        }

        public async Task<MethodResult<int>> GetTotalCategoryAsync()
        {
            var total = await _categoryRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số danh mục : {total}");
        }

        public async Task<IMethodResult<List<CategoryDto>>> GetBySellerAsync(GridInfo grid)
        {
            var sellerId = _userPrincipalService.GetUserId();

            IQueryable<Category> query = _categoryRepo.TableNoTracking
                .Where(c => !c.IsDeleted && c.SellerId.HasValue && c.SellerId.Value == sellerId);

            if (!string.IsNullOrWhiteSpace(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(keyword) ||
                                         c.Description.ToLower().Contains(keyword));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(c => c.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .ToListAsync();

            var result = data.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                SellerId = sellerId,
                ParentCategoryId = c.ParentCategoryId
            }).ToList();

            return MethodResult<List<CategoryDto>>.ResultWithData(result, "Lấy danh mục của seller thành công", total);
        }

        public async Task<IMethodResult<CategoryDto>> GetByIdAsync(Guid id)
        {
            var category = await _categoryRepo.TableNoTracking
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (category == null)
                return MethodResult<CategoryDto>.ResultWithError("Không tìm thấy danh mục");

            var dto = new CategoryDto
            {
                Id = category.Id, // ✅ Thêm Id
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                ParentCategoryId = category.ParentCategoryId
            };

            return MethodResult<CategoryDto>.ResultWithData(dto, "Lấy chi tiết danh mục thành công");
        }

        // ✅ FIXED: CreateAsync với xử lý lỗi đầy đủ
        public async Task<IMethodResult<CategoryDto>> CreateAsync(CreateCategoryDto dto)
        {
            try
            {
                var sellerId = _userPrincipalService.GetUserId();

                // ✅ KIỂM TRA FILE NULL
                if (dto.ImageFile == null)
                {
                    return MethodResult<CategoryDto>.ResultWithError("Vui lòng chọn ảnh đại diện");
                }

                string? imageUrl = null;

                // ✅ XỬ LÝ UPLOAD ẢNH VỚI TRY-CATCH
                try
                {
                    imageUrl = await _cloudinaryService.UploadImageAsync(dto.ImageFile);
                }
                catch (ArgumentException ex)
                {
                    // ✅ Lỗi validation từ CloudinaryService (file không phải ảnh, quá lớn, etc.)
                    return MethodResult<CategoryDto>.ResultWithError(ex.Message);
                }
                catch (Exception ex)
                {
                    // ✅ Lỗi khác (network, cloudinary service down, etc.)
                    return MethodResult<CategoryDto>.ResultWithError($"Không thể upload ảnh: {ex.Message}");
                }

                // ✅ TẠO CATEGORY
                var entity = new Category
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name,
                    Description = dto.Description,
                    ImageUrl = imageUrl,
                    ParentCategoryId = dto.ParentCategoryId,
                    SellerId = sellerId,
                    Created = DateTime.Now,
                };

                await _categoryRepo.AddAsync(entity);
                await _categoryRepo.SaveChangesAsync();

                var resultDto = new CategoryDto
                {
                    Id = entity.Id,
                    Name = entity.Name,
                    Description = entity.Description,
                    ImageUrl = entity.ImageUrl,
                    SellerId = entity.SellerId,
                    ParentCategoryId = entity.ParentCategoryId
                };

                return MethodResult<CategoryDto>.ResultWithData(resultDto, "Tạo danh mục thành công");
            }
            catch (Exception ex)
            {
                // ✅ BẮT MỌI LỖI KHÁC
                return MethodResult<CategoryDto>.ResultWithError($"Có lỗi xảy ra khi tạo danh mục: {ex.Message}");
            }
        }

        // ✅ FIXED: UpdateAsync với xử lý lỗi đầy đủ
        public async Task<IMethodResult<CategoryDto>> UpdateAsync(Guid id, UpdateCategoryDto dto)
        {
            try
            {
                var sellerId = _userPrincipalService.GetUserId();

                var category = await _categoryRepo.GetByIdAsync(id);

                if (category == null || category.IsDeleted)
                    return MethodResult<CategoryDto>.ResultWithError("Danh mục không tồn tại");

                if (category.SellerId != sellerId)
                    return MethodResult<CategoryDto>.ResultWithError("Bạn không có quyền sửa danh mục này");

                if (dto.ParentCategoryId == id)
                    return MethodResult<CategoryDto>.ResultWithError("Không thể chọn chính danh mục này làm danh mục cha");

                string? imageUrl = category.ImageUrl;

                // ✅ XỬ LÝ UPLOAD ẢNH MỚI (NẾU CÓ)
                if (dto.ImageFile != null)
                {
                    try
                    {
                        imageUrl = await _cloudinaryService.UploadImageAsync(dto.ImageFile);

                    }
                    catch (ArgumentException ex)
                    {
                        // ✅ Lỗi validation (file không phải ảnh)
                        return MethodResult<CategoryDto>.ResultWithError(ex.Message);
                    }
                    catch (Exception ex)
                    {
                        // ✅ Lỗi upload
                        return MethodResult<CategoryDto>.ResultWithError($"Không thể upload ảnh: {ex.Message}");
                    }
                }
                // ✅ XỬ LÝ XÓA ẢNH (NẾU FRONTEND GỬI FLAG)
                else if (dto.RemoveImage)
                {
                    imageUrl = null;
                }

                // ✅ CẬP NHẬT THÔNG TIN
                category.Name = dto.Name;
                category.Description = dto.Description;
                category.ImageUrl = imageUrl;
                category.ParentCategoryId = dto.ParentCategoryId;
                category.Modified = DateTime.Now;

                category.MarkDirty(nameof(category.ImageUrl));
                category.MarkDirty(nameof(category.Name));
                category.MarkDirty(nameof(category.Description));
                category.MarkDirty(nameof(category.ParentCategoryId));
                category.MarkDirty(nameof(category.Modified));

                await _categoryRepo.UpdateAsync(category);
                await _categoryRepo.SaveChangesAsync();

                var resultDto = new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    ImageUrl = category.ImageUrl,
                    SellerId = category.SellerId,
                    ParentCategoryId = category.ParentCategoryId
                };

                return MethodResult<CategoryDto>.ResultWithData(resultDto, "Cập nhật danh mục thành công");
            }
            catch (Exception ex)
            {
                // ✅ BẮT MỌI LỖI KHÁC
                return MethodResult<CategoryDto>.ResultWithError($"Có lỗi xảy ra khi cập nhật danh mục: {ex.Message}");
            }
        }

        public async Task<IMethodResult<bool>> DeleteAsync(Guid categoryId)
        {
            try
            {
                var category = await _categoryRepo.GetByIdAsync(categoryId);
                if (category == null)
                {
                    return MethodResult<bool>.ResultWithError("Không tìm thấy danh mục.");
                }

                await _categoryRepo.DeleteAsync(category);
                return MethodResult<bool>.ResultWithData(true, "Xóa danh mục thành công.");
            }
            catch (Exception ex)
            {
                return MethodResult<bool>.ResultWithError($"Có lỗi xảy ra khi xóa danh mục: {ex.Message}");
            }
        }
    }
}