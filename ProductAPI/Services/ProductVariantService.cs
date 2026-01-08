using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Product;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;

namespace ProductAPI.Services
{
    public class ProductVariantService : BaseService<ProductVariant>, IProductVariantService
    {
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<ProductVariant> _productVariantRepo;
        private readonly IUserPrincipalService _userPrincipalService;
        private readonly CloudinaryService _cloudinaryService;

        public ProductVariantService(
            IRepository<Product> productRepo,
            IUserPrincipalService userPrincipalService,
            IRepository<ProductVariant> productVariantRepo,
            CloudinaryService cloudinaryService) : base(productVariantRepo)
        {
            _productRepo = productRepo;
            _userPrincipalService = userPrincipalService;
            _productVariantRepo = productVariantRepo;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<IMethodResult<List<ProductVariantDto>>> GetByProductIdAsync(Guid productId)
        {
            var variants = await _productVariantRepo
                .TableNoTracking
                .Where(x => x.ProductId == productId && !x.IsDeleted)
                .ToListAsync();

            var result = variants.Select(x => new ProductVariantDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                VariantName = x.VariantName,
                VariantValue = x.VariantValue,
                Price = x.Price,
                StockQuantity = x.StockQuantity,
                ImageUrl = x.ImageUrl
            }).ToList();

            return MethodResult<List<ProductVariantDto>>.ResultWithData(result, "Lấy danh sách biến thể thành công");
        }

        public async Task<IMethodResult<List<ProductVariantDto>>> AddVariantsAsync(
    List<CreateProductVariantDto> variants)
        {
            if (variants == null || !variants.Any())
                return MethodResult<List<ProductVariantDto>>
                    .ResultWithError("Danh sách biến thể trống");

            var addedVariants = new List<ProductVariantDto>();
            var currentUserId = _userPrincipalService.GetUserId();

            foreach (var variant in variants)
            {
                var product = await _productRepo.GetByIdAsync(variant.ProductId);
                if (product == null || product.CreatedBy != currentUserId)
                    return MethodResult<List<ProductVariantDto>>
                        .ResultWithError("Bạn không có quyền thêm biến thể cho sản phẩm này");

                string? imageUrl = null;

                if (variant.ImageFile != null)
                {
                    try
                    {
                        imageUrl = await _cloudinaryService.UploadImageAsync(variant.ImageFile);
                    }
                    catch (ArgumentException ex)
                    {
                        // ❗ BẮT LỖI ĐỊNH DẠNG FILE
                        return MethodResult<List<ProductVariantDto>>
                            .ResultWithError(ex.Message);
                    }
                    catch (Exception)
                    {
                        return MethodResult<List<ProductVariantDto>>
                            .ResultWithError("Tải ảnh biến thể thất bại");
                    }
                }

                var entity = new ProductVariant
                {
                    Id = Guid.NewGuid(),
                    ProductId = variant.ProductId,
                    VariantName = variant.VariantName,
                    VariantValue = variant.VariantValue,
                    Price = variant.Price,
                    StockQuantity = variant.StockQuantity,
                    ImageUrl = imageUrl,
                    Created = DateTime.Now,
                    CreatedBy = currentUserId
                };

                await _productVariantRepo.AddAsync(entity);

                addedVariants.Add(new ProductVariantDto
                {
                    Id = entity.Id,
                    ProductId = entity.ProductId,
                    VariantName = entity.VariantName,
                    VariantValue = entity.VariantValue,
                    Price = entity.Price,
                    StockQuantity = entity.StockQuantity,
                    ImageUrl = entity.ImageUrl
                });
            }

            return MethodResult<List<ProductVariantDto>>
                .ResultWithData(addedVariants, "Thêm danh sách biến thể thành công");
        }

        public async Task<IMethodResult<ProductVariantDto>> UpdateVariantAsync(
    UpdateProductVariantDto dto)
        {
            var variant = await _productVariantRepo.GetByIdAsync(dto.Id);
            if (variant == null)
                return MethodResult<ProductVariantDto>
                    .ResultWithError("Không tìm thấy biến thể sản phẩm");

            var product = await _productRepo.GetByIdAsync(variant.ProductId);
            var currentUserId = _userPrincipalService.GetUserId();

            if (product == null || product.CreatedBy != currentUserId)
                return MethodResult<ProductVariantDto>
                    .ResultWithError("Bạn không có quyền sửa biến thể này");

            // ===== UPDATE BASIC INFO =====
            variant.VariantName = dto.VariantName;
            variant.VariantValue = dto.VariantValue;
            variant.Price = dto.Price;
            variant.StockQuantity = dto.StockQuantity;

            // ===== UPDATE IMAGE =====
            if (dto.ImageFile != null)
            {
                try
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(dto.ImageFile);
                    variant.ImageUrl = uploadResult;
                }
                catch (ArgumentException ex)
                {
                    return MethodResult<ProductVariantDto>
                        .ResultWithError(ex.Message);
                }
                catch (Exception)
                {
                    return MethodResult<ProductVariantDto>
                        .ResultWithError("Tải ảnh biến thể thất bại");
                }
            }
            else if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                // giữ ảnh cũ hoặc set lại url
                variant.ImageUrl = dto.ImageUrl;
            }

            // ===== TRACK DIRTY =====
            variant.MarkDirty(nameof(variant.VariantName));
            variant.MarkDirty(nameof(variant.VariantValue));
            variant.MarkDirty(nameof(variant.Price));
            variant.MarkDirty(nameof(variant.StockQuantity));
            variant.MarkDirty(nameof(variant.ImageUrl));

            await _productVariantRepo.UpdateAsync(variant);

            var result = new ProductVariantDto
            {
                Id = variant.Id,
                ProductId = variant.ProductId,
                VariantName = variant.VariantName,
                VariantValue = variant.VariantValue,
                Price = variant.Price,
                StockQuantity = variant.StockQuantity,
                ImageUrl = variant.ImageUrl
            };

            return MethodResult<ProductVariantDto>
                .ResultWithData(result, "Cập nhật biến thể thành công");
        }



    }


}
