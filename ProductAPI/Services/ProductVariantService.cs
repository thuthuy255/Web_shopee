using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Product;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;

namespace ProductAPI.Services
{
    public class ProductVariantService :BaseService<ProductVariant>, IProductVariantService
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
                Color = x.Color,
                Size = x.Size,
                Price = x.Price,
                StockQuantity = x.StockQuantity
            }).ToList();

            return MethodResult<List<ProductVariantDto>>.ResultWithData(result, "Lấy danh sách biến thể thành công");
        }

        public async Task<IMethodResult<List<ProductVariantDto>>> AddVariantsAsync(List<CreateProductVariantDto> variants)
        {
            if (variants == null || !variants.Any())
                return MethodResult<List<ProductVariantDto>>.ResultWithError("Danh sách biến thể trống");

            var addedVariants = new List<ProductVariantDto>();

            foreach (var variant in variants)
            {
                string? imageUrl = null;

                if (variant.ImageFile != null)
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(variant.ImageFile);
                    if (string.IsNullOrEmpty(uploadResult))
                        return MethodResult<List<ProductVariantDto>>.ResultWithError("Tải ảnh lên thất bại");
                    imageUrl = uploadResult;
                }

                var entity = new ProductVariant
                {
                    Id = Guid.NewGuid(),
                    ProductId = variant.ProductId,
                    Color = variant.Color,
                    Size = variant.Size,
                    Price = variant.Price,
                    StockQuantity = variant.StockQuantity,
                    ImageUrl = imageUrl,
                    Created = DateTime.UtcNow,
                    CreatedBy = _userPrincipalService.GetUserId()
                };

                await _productVariantRepo.AddAsync(entity);

                addedVariants.Add(new ProductVariantDto
                {
                    Id = entity.Id,
                    ProductId = entity.ProductId,
                    Color = entity.Color,
                    Size = entity.Size,
                    Price = entity.Price,
                    StockQuantity = entity.StockQuantity,
                    ImageUrl = entity.ImageUrl
                });
            }

            return MethodResult<List<ProductVariantDto>>.ResultWithData(addedVariants, "Thêm danh sách biến thể thành công");
        }






        public async Task<IMethodResult<bool>> DeleteVariantAsync(Guid variantId)
        {
            var variant = await _productVariantRepo.GetByIdAsync(variantId);
            if (variant == null || variant.IsDeleted)
                return MethodResult<bool>.ResultWithError("Không tìm thấy biến thể");

            variant.IsDeleted = true;
            variant.Created = DateTime.UtcNow;
            variant.ModifiedBy = _userPrincipalService.GetUserId();

            _productVariantRepo.UpdateAsync(variant);
            return MethodResult<bool>.ResultWithData(true, "Xóa biến thể thành công");
        }

    }

}
