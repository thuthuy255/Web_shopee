using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
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
        private readonly IRepository<User> _userRepo;
        private readonly IRepository<ProductVariant> _productVariantRepo;


        public ProductService(
            IRepository<Product> productRepo,
            IUserPrincipalService userPrincipalService,
            CloudinaryService cloudinaryService,
            IRepository<Category> categoryRepo,
            IRepository<User> userRepo,
            IRepository<ProductVariant> productVariantRepo) : base(productRepo)
        {
            _productRepo = productRepo;
            _userPrincipalService = userPrincipalService;
            _cloudinaryService = cloudinaryService;
            _categoryRepo = categoryRepo;
            _productVariantRepo = productVariantRepo;
            _userRepo = userRepo;
        }

        public async Task<MethodResult<List<ProductWithCategoryDto>>> FilterProductAsync(GridInfo grid)
        {
            var currentUserId = _userPrincipalService.GetUserId();
            var currentRole = _userPrincipalService.GetRoleUser();

            var query = from p in _productRepo.TableNoTracking
                        join c in _categoryRepo.TableNoTracking on p.CategoryId equals c.Id into pc
                        from c in pc.DefaultIfEmpty()
                        join u in _userRepo.TableNoTracking on p.SellerId equals u.Id into pu
                        from u in pu
                        where !p.IsDeleted && (c == null || !c.IsDeleted)
                        select new { p, c, u };

            if (currentRole == Constant.Constants.ROLE_SELLER)
            {
                query = query.Where(x => x.p.SellerId == currentUserId);
            }
            if (!string.IsNullOrWhiteSpace(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();

                query = query.Where(x =>
                    x.p.ProductName.ToLower().Contains(keyword) ||
                    x.p.Price.ToString().Contains(keyword) ||
                    (x.c != null && x.c.Name.ToLower().Contains(keyword)) ||
                    (x.u != null && !string.IsNullOrEmpty(x.u.Username) && x.u.Username.ToLower().Contains(keyword))
                );
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
                IsActive = x.p.StockQuantity == 0 ? false : x.p.IsActive,
                SellerStatus = x.p.SellerStatus,
                Thumbnail = x.p.Thumbnail,
                SellerName = x.u.Username,
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
                                VariantName = v.VariantName,
                                VariantValue = v.VariantValue,
                                Price = v.Price,
                                StockQuantity = v.StockQuantity,
                                ImageUrl = v.ImageUrl
                            }).ToList()
            }).ToList();

            return MethodResult<List<ProductWithCategoryDto>>.ResultWithData(result, "Lấy danh sách sản phẩm thành công", total);
        }
        public async Task<MethodResult<int>> GetTotalProductAsync()
        {
            var total = await _productRepo.TableNoTracking.CountAsync();
            return MethodResult<int>.ResultWithData(total, $"Tổng số sản phẩm: {total}");
        }
        public async Task<IMethodResult<ProductResultDto>> GetByIdAsync(Guid productId)
        {
            var product = await _productRepo
                .TableNoTracking
                .Include(p => p.ProductVariants)
                 .Include(p => p.Seller)
                 .Include(p =>p.Category)
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
                IsActive = product.IsActive,
                SellerStatus = product.SellerStatus,
                Thumbnail = product.Thumbnail,
                CategoryId = product.CategoryId,
                SellerId = product.SellerId,
                SellerName= product.Seller.FullName,
                CategoryName = product.Category.Name,
                Created = product.Created,
                IsDeleted = product.IsDeleted,
                ProductImages = string.IsNullOrWhiteSpace(product.ImageListJson)
                    ? new List<string>()
                    : product.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                ProductVariants = product.ProductVariants?.Where(v => !v.IsDeleted)
                                ?.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    ProductId = v.ProductId,
                    VariantName = v.VariantName,
                    VariantValue = v.VariantValue,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl,
                }).ToList()
            };

            return MethodResult<ProductResultDto>.ResultWithData(dto, "Lấy sản phẩm thành công");
        }


        public async Task<IMethodResult<List<ProductWithCategoryDto>>> getAllListProducts(Guid sellerId, SearchProducts request)
        {
            var query = _productRepo.TableNoTracking;

            // Filter keyword
            if (!string.IsNullOrEmpty(request.KeyWord))
            {
                query = query.Where(p => p.ProductName.Contains(request.KeyWord));
            }

            // ✅ Sửa logic filter status để khớp với 3 trạng thái
            if (!string.IsNullOrEmpty(request.Status))
            {
                switch (request.Status.ToLower())
                {
                    case "active":
                        query = query.Where(p => p.SellerStatus == true);
                        break;
                    case "inactive":
                        query = query.Where(p => p.SellerStatus == false && p.StockQuantity > 0);
                        break;
                    case "outofstock":
                        query = query.Where(p => p.StockQuantity == 0);
                        break;
                }
            }

            // ✅ Tạo query đầy đủ với join
            var fullQuery = from p in query
                            join c in _categoryRepo.TableNoTracking on p.CategoryId equals c.Id
                            where !p.IsDeleted && p.SellerId == sellerId && !c.IsDeleted
                            select new { p, c };

            // ✅ Đếm total từ query SAU KHI join
            var totalRecord = await fullQuery.CountAsync();

            // ✅ Lấy data
            var result = await fullQuery
                .OrderByDescending(x => x.p.Id)
                .Select(x => new ProductWithCategoryDto
                {
                    Id = x.p.Id,
                    ProductName = x.p.ProductName,
                    Description = x.p.Description,
                    Price = x.p.Price,
                    StockQuantity = x.p.StockQuantity,
                    IsActive = x.p.StockQuantity == 0 ? false : x.p.IsActive,
                    SellerStatus = x.p.SellerStatus,
                    Thumbnail = x.p.Thumbnail,
                    ProductImages = string.IsNullOrWhiteSpace(x.p.ImageListJson)
                        ? new List<string>()
                        : x.p.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                    CategoryId = x.c.Id,
                    CategoryName = x.c.Name,
                    CategoryDescription = x.c.Description,
                    CategoryImageUrl = x.c.ImageUrl,
                    ParentCategoryId = x.c.ParentCategoryId,
                    Variants = _productVariantRepo.TableNoTracking
                        .Where(v => v.ProductId == x.p.Id && !v.IsDeleted)
                        .Select(v => new ProductVariantDto
                        {
                            Id = v.Id,
                            VariantName = v.VariantName,
                            Price = v.Price,
                            StockQuantity = v.StockQuantity
                        }).ToList()
                })
                .ToListAsync();

            return MethodResult<List<ProductWithCategoryDto>>.ResultWithData(
                result,
                "Lấy danh sách sản phẩm theo seller thành công",
                totalRecord
            );
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
                            // Nếu hết hàng thì mặc định isActive = false
                            IsActive = p.StockQuantity == 0 ? false : p.IsActive,
                            SellerStatus = p.SellerStatus,
                            Thumbnail = p.Thumbnail,
                            ProductImages = string.IsNullOrWhiteSpace(p.ImageListJson)
                                ? new List<string>()
                                : p.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                            CategoryId = c.Id,
                            CategoryName = c.Name,
                            CategoryDescription = c.Description,
                            CategoryImageUrl = c.ImageUrl,
                            ParentCategoryId = c.ParentCategoryId,
                            Variants = _productVariantRepo.TableNoTracking
                                            .Where(v => v.ProductId == p.Id)
                                            .Select(v => new ProductVariantDto
                                            {
                                                Id = v.Id,
                                                VariantName = v.VariantName,
                                                Price = v.Price,
                                                StockQuantity = v.StockQuantity
                                            }).ToList()
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

        public async Task<IMethodResult<SellerProductListDto>> GetShopWithProductsAsync(Guid sellerId, GridInfo grid)
        {
            var seller = await _userRepo.TableNoTracking
                .Where(u => u.Id == sellerId && !u.IsDeleted)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Avatar
                })
                .FirstOrDefaultAsync();

            if (seller == null)
                return MethodResult<SellerProductListDto>.ResultWithError("Không tìm thấy shop");

            // lấy danh sách sản phẩm bằng cách tái sử dụng hàm cũ
            var productResult = await FilterProductBySellerAsync(sellerId, grid);
            if (!productResult.Success)
                return MethodResult<SellerProductListDto>.ResultWithError(productResult.Error);

            var result = new SellerProductListDto
            {
                SellerId = seller.Id,
                SellerName = seller.FullName,
                SellerEmail = seller.Email,
                SellerAvatar = seller.Avatar,
                Products = productResult.Data ?? new List<ProductWithCategoryDto>()
            };

            return MethodResult<SellerProductListDto>.ResultWithData(result, "Lấy thông tin shop + sản phẩm thành công", productResult.TotalRecord);
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
                                  IsActive = p.IsActive,
                                  SellerStatus = p.SellerStatus,
                                  Thumbnail = p.Thumbnail,
                                  ProductImages = string.IsNullOrWhiteSpace(p.ImageListJson)
                                                  ? new List<string>()
                                                  : p.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                                  CategoryId = c.Id,
                                  CategoryName = c.Name,
                                  CategoryDescription = c.Description,
                                  CategoryImageUrl = c.ImageUrl,
                                  ParentCategoryId = c.ParentCategoryId,
                                  Variants = _productVariantRepo.TableNoTracking
                                            .Where(v => v.ProductId == p.Id)
                                            .Select(v => new ProductVariantDto
                                            {
                                                Id = v.Id,
                                                VariantName = v.VariantName,
                                                Price = v.Price,
                                                StockQuantity = v.StockQuantity
                                            }).ToList()
                              })
                              .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                              .Take(grid.PageInfo.PageSize)
                              .ToListAsync();

            return MethodResult<List<ProductWithCategoryDto>>.ResultWithData(data, "Lấy sản phẩm theo danh mục thành công", total);
        }


        public async Task<IMethodResult<ProductResultDto>> CreateProductFromFormAsync(ProductFormDataDto dto, Guid sellerId)
        {
            var product = new Product
            {
                Id = Guid.NewGuid(),
                ProductName = dto.ProductName ?? "",
                Description = dto.Description ?? "",
                Price = dto.Price ?? 0,
                StockQuantity = dto.StockQuantity ?? 0,
                IsActive = dto.IsActive,
                SellerStatus = dto.SellerStatus,
                CategoryId = dto.CategoryId ?? Guid.Empty,
                SellerId = sellerId
            };

            string? thumbnailUrl = product.Thumbnail;

            // ✅ UPLOAD ẢNH MỚI
            if (dto.Thumbnail != null)
            {
                try
                {
                    thumbnailUrl = await _cloudinaryService.UploadImageAsync(dto.Thumbnail);
                }
                catch (ArgumentException ex)
                {
                    return MethodResult<ProductResultDto>
                        .ResultWithError(ex.Message);
                }
                catch (Exception ex)
                {
                    return MethodResult<ProductResultDto>
                        .ResultWithError($"Không thể upload ảnh đại diện: {ex.Message}");
                }
            }
            // ✅ XÓA ẢNH
            else if (dto.RemoveImage)
            {
                thumbnailUrl = null;
            }

            product.Thumbnail = thumbnailUrl;
            product.MarkDirty(nameof(product.Thumbnail));



            await _productRepo.AddAsync(product);
            await _productRepo.SaveChangesAsync();

            var result = new ProductResultDto
            {
                Id = product.Id,
                ProductName = product.ProductName,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                SellerStatus = product.SellerStatus,
                Thumbnail = product.Thumbnail,
                ProductImages = string.IsNullOrWhiteSpace(product.ImageListJson)
                    ? new List<string>()
                    : product.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                CategoryId = product.CategoryId
            };

            return MethodResult<ProductResultDto>.ResultWithData(result, "Thêm sản phẩm thành công (chưa có biến thể)");
        }


        public async Task<IMethodResult<ProductResultDto>> UpdateProductFromFormAsync(Guid productId, ProductFormDataDto dto)
        {
            var product = await _productRepo.GetByIdAsync(productId);
            if (product == null)
                return MethodResult<ProductResultDto>.ResultWithError("Không tìm thấy sản phẩm");

            product.ProductName = dto.ProductName ?? "";
            product.Description = dto.Description ?? "";
            product.Price = dto.Price ?? 0;
            product.StockQuantity = dto.StockQuantity ?? 0;
            product.IsActive = dto.IsActive;
            product.SellerStatus = dto.SellerStatus;

            if (dto.CategoryId.HasValue && dto.CategoryId != Guid.Empty)
            {
                product.CategoryId = dto.CategoryId.Value;
                product.MarkDirty(nameof(product.CategoryId));
            }

            product.MarkDirty(nameof(product.Price));
            product.MarkDirty(nameof(product.StockQuantity));
            product.MarkDirty(nameof(product.Description));
            product.MarkDirty(nameof(product.IsActive));
            product.MarkDirty(nameof(product.SellerStatus));
            product.MarkDirty(nameof(product.ProductName));

            // ================== THUMBNAIL ==================
            string? thumbnailUrl = product.Thumbnail;

            // ✅ UPLOAD ẢNH MỚI
            if (dto.Thumbnail != null)
            {
                try
                {
                    thumbnailUrl = await _cloudinaryService.UploadImageAsync(dto.Thumbnail);
                }
                catch (ArgumentException ex)
                {
                    return MethodResult<ProductResultDto>.ResultWithError(ex.Message);
                }
                catch (Exception ex)
                {
                    return MethodResult<ProductResultDto>
                        .ResultWithError($"Không thể upload ảnh đại diện: {ex.Message}");
                }
            }
            // ✅ XÓA ẢNH
            else if (dto.RemoveImage)
            {
                thumbnailUrl = null;
            }

            product.Thumbnail = thumbnailUrl;
            product.MarkDirty(nameof(product.Thumbnail));


            // ================== PRODUCT IMAGES ==================
            string? imageListJson = product.ImageListJson;

            // ✅ UPLOAD / GIỮ ẢNH CŨ
            if (!string.IsNullOrEmpty(dto.ExistingProductImages) ||
                (dto.ProductImages != null && dto.ProductImages.Any()))
            {
                var imageUrls = new List<string>();

                // 1️⃣ Giữ ảnh cũ
                if (!string.IsNullOrEmpty(dto.ExistingProductImages))
                {
                    var oldImages =
                        JsonConvert.DeserializeObject<List<string>>(dto.ExistingProductImages);

                    if (oldImages != null && oldImages.Any())
                        imageUrls.AddRange(oldImages);
                }

                // 2️⃣ Upload ảnh mới
                if (dto.ProductImages != null && dto.ProductImages.Any())
                {
                    foreach (var image in dto.ProductImages)
                    {
                        try
                        {
                            var url = await _cloudinaryService.UploadImageAsync(image);
                            imageUrls.Add(url);
                        }
                        catch (ArgumentException ex)
                        {
                            return MethodResult<ProductResultDto>.ResultWithError(ex.Message);
                        }
                        catch (Exception ex)
                        {
                            return MethodResult<ProductResultDto>
                                .ResultWithError($"Không thể upload ảnh chi tiết: {ex.Message}");
                        }
                    }
                }

                imageListJson = imageUrls.Any()
                    ? $";{string.Join(';', imageUrls)};"
                    : null;
            }
         
            product.ImageListJson = imageListJson;
            product.MarkDirty(nameof(product.ImageListJson));



            if (dto.Variants != null)
            {
                var existingVariants = _productVariantRepo.Table.Where(v => v.ProductId == productId).ToList();

                // Các Id FE gửi lên
                var dtoIds = dto.Variants.Where(v => v.Id.HasValue).Select(v => v.Id.Value).ToList();

                foreach (var variantDto in dto.Variants)
                {
                    if (variantDto.Id.HasValue)
                    {
                        var variant = existingVariants.FirstOrDefault(v => v.Id == variantDto.Id.Value);
                        if (variant != null)
                        {
                            variant.VariantName = variantDto.VariantName;
                            variant.VariantValue = variantDto.VariantValue;
                            variant.Price = variantDto.Price ?? variant.Price;
                            variant.StockQuantity = variantDto.StockQuantity ?? variant.StockQuantity;

                            if (variantDto.ImageFile != null)
                            {
                                var imageUrl = await _cloudinaryService.UploadImageAsync(variantDto.ImageFile);
                                if (!string.IsNullOrEmpty(imageUrl))
                                {
                                    variant.ImageUrl = imageUrl;
                                }
                            }

                            variant.MarkDirty(nameof(variant.VariantName));
                            variant.MarkDirty(nameof(variant.VariantValue));
                            variant.MarkDirty(nameof(variant.Price));
                            variant.MarkDirty(nameof(variant.StockQuantity));
                            variant.MarkDirty(nameof(variant.ImageUrl));

                            await _productVariantRepo.UpdateAsync(variant);
                        }
                    }
                    else
                    {
                        string? imageUrl = null;
                        if (variantDto.ImageFile != null)
                        {
                            imageUrl = await _cloudinaryService.UploadImageAsync(variantDto.ImageFile);
                        }

                        var newVariant = new ProductVariant
                        {
                            Id = Guid.NewGuid(),
                            ProductId = productId,
                            VariantName = variantDto.VariantName,
                            VariantValue = variantDto.VariantValue,
                            Price = variantDto.Price ?? 0,
                            StockQuantity = variantDto.StockQuantity ?? 0,
                            IsDeleted = false,
                            ImageUrl = imageUrl,
                            CreatedAt = DateTime.Now
                        };
                        await _productVariantRepo.AddAsync(newVariant);
                    }
                }
                var variantsToDelete = existingVariants.Where(v => !dtoIds.Contains(v.Id)).ToList();
                foreach (var variant in variantsToDelete)
                {
                    await _productVariantRepo.DeleteAsync(variant);
                }
            }


            await _productRepo.UpdateAsync(product);
            await _productRepo.SaveChangesAsync();

            var result = new ProductResultDto
            {
                Id = product.Id,
                ProductName = product.ProductName,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                SellerStatus = product.SellerStatus,
                Thumbnail = product.Thumbnail,
                ProductImages = string.IsNullOrWhiteSpace(product.ImageListJson)
                    ? new List<string>()
                    : product.ImageListJson.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
                CategoryId = product.CategoryId,
                ProductVariants = product.ProductVariants != null
                                ? product.ProductVariants.Select(v => new ProductVariantDto
                                {
                                    Id = v.Id,
                                    VariantName = v.VariantName,
                                    Price = v.Price,
                                    StockQuantity = v.StockQuantity,
                                    // nếu có thêm Thumbnail riêng cho variant thì map vào
                                    ImageUrl = v.ImageUrl,
                                }).ToList()
        : new List<ProductVariantDto>()
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
        public async Task<IMethodResult<bool>> DeleteVariantAsync(Guid variantId)
        {
            var variant = await _productVariantRepo.GetByIdAsync(variantId);
            if (variant == null || variant.IsDeleted)
                return MethodResult<bool>.ResultWithError("Không tìm thấy biến thể");

            var product = await _productRepo.GetByIdAsync(variant.ProductId);
            if (product == null)
                return MethodResult<bool>.ResultWithError("Sản phẩm không tồn tại");

            var currentUserId = _userPrincipalService.GetUserId();
            if (!currentUserId.HasValue || product.CreatedBy != currentUserId)
                return MethodResult<bool>.ResultWithError("Bạn không có quyền xóa biến thể này");

            // Soft delete
            await _productVariantRepo.DeleteAsync(variant);

            return MethodResult<bool>.ResultWithData(true, "Xóa biến thể thành công");
        }


    }
}
