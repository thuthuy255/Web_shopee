using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.Product;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;

namespace ProductAPI.Services
{
    public class ProductService : BaseService<Product>, IProductService
    {
        private readonly IRepository<Product> _productRepo;
        private readonly IUserPrincipalService _userPrincipalService;
        private readonly CloudinaryService _cloudinaryService;
        private readonly IRepository<Category> _categoryRepo;
        private readonly IRepository<ProductVariant> _productVariantRepo;


        public ProductService(
            IRepository<Product> productRepo,
            IUserPrincipalService userPrincipalService,
            CloudinaryService cloudinaryService,
            IRepository<Category> categoryRepo,
            IRepository<ProductVariant> productVariantRepo) : base(productRepo)
        {
            _productRepo = productRepo;
            _userPrincipalService = userPrincipalService;
            _cloudinaryService = cloudinaryService;
            _categoryRepo = categoryRepo;
            _productVariantRepo = productVariantRepo;
        }

        public async Task<MethodResult<List<ProductWithCategoryDto>>> FilterProductAsync(GridInfo grid)
        {
            var currentUserId = _userPrincipalService.GetUserId();
            var currentRole = _userPrincipalService.GetRoleUser();

            var query = from p in _productRepo.TableNoTracking
                        join c in _categoryRepo.TableNoTracking on p.CategoryId equals c.Id into pc
                        from c in pc.DefaultIfEmpty()
                        where !p.IsDeleted && (c == null || !c.IsDeleted)
                        select new { p, c };

            if (currentRole == Constant.Constants.ROLE_SELLER)
            {
                query = query.Where(x => x.p.SellerId == currentUserId);
            }

            if (!string.IsNullOrWhiteSpace(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(x => x.p.ProductName.ToLower().Contains(keyword));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.p.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .ToListAsync();

            var result = data.Select(x => new ProductWithCategoryDto
            {
                Id = x.p.Id,
                ProductName = x.p.ProductName,
                Description = x.p.Description,
                Price = x.p.Price,
                StockQuantity = x.p.StockQuantity,
                Status = x.p.Status,
                Thumbnail = x.p.Thumbnail,
                ProductImages = string.IsNullOrWhiteSpace(x.p.ImageListJson)
                                ? new List<string>()
                                : x.p.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                CategoryId = x.c?.Id ?? Guid.Empty,
                CategoryName = x.c?.Name,
                CategoryDescription = x.c?.Description,
                CategoryImageUrl = x.c?.ImageUrl,
                ParentCategoryId = x.c?.ParentCategoryId,
                Variants = _productVariantRepo.TableNoTracking
                            .Where(v => v.ProductId == x.p.Id && !v.IsDeleted)
                            .Select(v => new ProductVariantDto
                            {
                                Id = v.Id,
                                ProductId = v.ProductId,
                                Color = v.Color,
                                Size = v.Size,
                                Price = v.Price,
                                StockQuantity = v.StockQuantity,
                                ImageUrl = v.ImageUrl
                            }).ToList()
            }).ToList();

            return MethodResult<List<ProductWithCategoryDto>>.ResultWithData(result, "Lấy danh sách sản phẩm thành công", total);
        }

        public async Task<IMethodResult<ProductResultDto>> GetByIdAsync(Guid productId)
        {
            var product = await _productRepo
                .TableNoTracking
                .Include(p => p.ProductVariants) // Include các biến thể
                .FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);

            if (product == null)
                return MethodResult<ProductResultDto>.ResultWithError("Không tìm thấy sản phẩm");

            var dto = new ProductResultDto
            {
                Id = product.Id,
                ProductName = product.ProductName,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Status = product.Status,
                Thumbnail = product.Thumbnail,
                ImageListJson = product.ImageListJson,
                CategoryId = product.CategoryId,
                SellerId = product.SellerId,
                Created = product.Created,
                IsDeleted = product.IsDeleted,

                ProductVariants = product.ProductVariants?.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    ProductId = v.ProductId,
                    Color = v.Color,
                    Size = v.Size,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl,
                }).ToList()

            };

            return MethodResult<ProductResultDto>.ResultWithData(dto,"Lấy sản phẩm thành công");
        }

        public async Task<IMethodResult<List<ProductWithCategoryDto>>> FilterProductBySellerAsync(Guid sellerId, GridInfo grid)
        {
            var query = from p in _productRepo.TableNoTracking
                        join c in _categoryRepo.TableNoTracking on p.CategoryId equals c.Id
                        where !p.IsDeleted && p.SellerId == sellerId && !c.IsDeleted
                        select new ProductWithCategoryDto
                        {
                            Id = p.Id,
                            ProductName = p.ProductName,
                            Description = p.Description,
                            Price = p.Price,
                            StockQuantity = p.StockQuantity,
                            Status = p.Status,
                            Thumbnail = p.Thumbnail,
                            ProductImages = string.IsNullOrWhiteSpace(p.ImageListJson)
                                ? new List<string>()
                                : p.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                            CategoryId = c.Id,
                            CategoryName = c.Name,
                            CategoryDescription = c.Description,
                            CategoryImageUrl = c.ImageUrl,
                            ParentCategoryId = c.ParentCategoryId,

                        };

            // Áp dụng tìm kiếm nếu có
            if (!string.IsNullOrWhiteSpace(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(x => x.ProductName.ToLower().Contains(keyword));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(p => p.Id)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .ToListAsync();

            return MethodResult<List<ProductWithCategoryDto>>.ResultWithData(data, "Lấy danh sách sản phẩm theo seller thành công", total);
        }


        public async Task<MethodResult<List<ProductWithCategoryDto>>> GetProductsByCategoryAsync(Guid categoryId, GridInfo grid)
        {
            IQueryable<Product> query = _productRepo.TableNoTracking
                .Where(p => !p.IsDeleted && p.CategoryId == categoryId);

            var categoryQuery = _categoryRepo.TableNoTracking
                .Where(c => !c.IsDeleted);

            var total = await query.CountAsync();

            var data = await (from p in query
                              join c in categoryQuery on p.CategoryId equals c.Id
                              orderby p.Created descending
                              select new ProductWithCategoryDto
                              {
                                  Id = p.Id,
                                  ProductName = p.ProductName,
                                  Description = p.Description,
                                  Price = p.Price,
                                  StockQuantity = p.StockQuantity,
                                  Status = p.Status,
                                  Thumbnail = p.Thumbnail,
                                  ProductImages = string.IsNullOrWhiteSpace(p.ImageListJson)
                                                  ? new List<string>()
                                                  : p.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                                  CategoryId = c.Id,
                                  CategoryName = c.Name,
                                  CategoryDescription = c.Description,
                                  CategoryImageUrl = c.ImageUrl,
                                  ParentCategoryId = c.ParentCategoryId
                              })
                              .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                              .Take(grid.PageInfo.PageSize)
                              .ToListAsync();

            return MethodResult<List<ProductWithCategoryDto>>.ResultWithData(data, "Lấy sản phẩm theo danh mục thành công", total);
        }


        public async Task<IMethodResult<ProductResultDto>> InsertProductFromFormAsync(ProductFormDataDto dto)
        {
            var currentUserId = _userPrincipalService.GetUserId();
            if (currentUserId == null)
                return MethodResult<ProductResultDto>.ResultWithError("Không xác định người dùng");
            if (dto.CategoryId == null || dto.CategoryId == Guid.Empty)
                return MethodResult<ProductResultDto>.ResultWithError("Danh mục không hợp lệ");

            string? thumbnailUrl = null;
            if (dto.Thumbnail != null)
            {
                thumbnailUrl = await _cloudinaryService.UploadImageAsync(dto.Thumbnail);
                if (string.IsNullOrEmpty(thumbnailUrl))
                    return MethodResult<ProductResultDto>.ResultWithError("Tải ảnh đại diện thất bại");
            }

            var imageUrls = new List<string>();
            if (dto.ProductImages?.Any() == true)
            {
                foreach (var image in dto.ProductImages)
                {
                    var url = await _cloudinaryService.UploadImageAsync(image);
                    if (!string.IsNullOrEmpty(url))
                        imageUrls.Add(url);
                }
            }

            var product = new Product
            {
                Id = Guid.NewGuid(),
                SellerId = currentUserId.Value,
                ProductName = dto.ProductName,
                Description = dto.Description,
                Price = dto.Price ?? 0,
                StockQuantity = dto.StockQuantity ?? 0,
                Status = dto.Status,
                Thumbnail = thumbnailUrl ?? "",
                ImageListJson = string.Join(';', imageUrls),
                CategoryId = dto.CategoryId.Value
            };

            await _productRepo.AddAsync(product);
            await _productRepo.SaveChangesAsync();

            var result = new ProductResultDto
            {
                Id = product.Id,
                ProductName = product.ProductName,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Status = product.Status,
                Thumbnail = product.Thumbnail,
                ProductImages = imageUrls,
                CategoryId = product.CategoryId
            };

            return MethodResult<ProductResultDto>.ResultWithData(result, "Tạo sản phẩm thành công");
        }

        public async Task<IMethodResult<ProductResultDto>> UpdateProductFromFormAsync(Guid productId, ProductFormDataDto dto)
        {
            var product = await _productRepo.GetByIdAsync(productId);
            if (product == null)
            {
                return MethodResult<ProductResultDto>.ResultWithError("Không tìm thấy sản phẩm");
            }

            product.ProductName = dto.ProductName ?? "";
            product.Description = dto.Description ?? "";
            product.Price = dto.Price ?? 0;
            product.StockQuantity = dto.StockQuantity ?? 0;
            product.Status = dto.Status ?? "";

            if (dto.CategoryId.HasValue && dto.CategoryId != Guid.Empty)
            {
                product.CategoryId = dto.CategoryId.Value;
                product.MarkDirty(nameof(product.CategoryId));
            }

            product.MarkDirty(nameof(product.Price));
            product.MarkDirty(nameof(product.StockQuantity));
            product.MarkDirty(nameof(product.Description));
            product.MarkDirty(nameof(product.Status));
            product.MarkDirty(nameof(product.ProductName));

            if (dto.Thumbnail != null)
            {
                var url = await _cloudinaryService.UploadImageAsync(dto.Thumbnail);
                if (!string.IsNullOrEmpty(url))
                {
                    product.Thumbnail = url;
                    product.MarkDirty(nameof(product.Thumbnail));
                }
            }

            if (dto.ProductImages != null && dto.ProductImages.Any())
            {
                var imageUrls = new List<string>();
                foreach (var image in dto.ProductImages)
                {
                    var url = await _cloudinaryService.UploadImageAsync(image);
                    if (!string.IsNullOrEmpty(url))
                        imageUrls.Add(url);
                }

                // Lưu dạng ;url1;url2;
                product.ImageListJson = imageUrls.Count > 0 ? $";{string.Join(';', imageUrls)};" : null;
                product.MarkDirty(nameof(product.ImageListJson));
            }

            await _productRepo.UpdateAsync(product);

            var result = new ProductResultDto
            {
                Id = product.Id,
                ProductName = product.ProductName,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Status = product.Status,
                Thumbnail = product.Thumbnail,
                // Trả về mảng cho FE
                ProductImages = string.IsNullOrWhiteSpace(product.ImageListJson)
                    ? new List<string>()
                    : product.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                CategoryId = product.CategoryId
            };

            return MethodResult<ProductResultDto>.ResultWithData(result, "Cập nhật sản phẩm thành công");
        }


        public async Task<IMethodResult<bool>> DeleteProductAsync(Guid productId)
        {
            var product = await _productRepo.GetByIdAsync(productId);
            if (product == null)
            {
                return MethodResult<bool>.ResultWithError("Không tìm thấy sản phẩm.");
            }

            await _productRepo.DeleteAsync(product);
            return MethodResult<bool>.ResultWithData(true, "Xóa sản phẩm thành công.");
        }
    }
}
