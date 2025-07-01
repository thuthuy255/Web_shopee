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

        public ProductService(IRepository<Product> productRepo) : base(productRepo)
        {
            _productRepo = productRepo;
        }

        // Lọc sản phẩm có phân trang
        public async Task<MethodResult<List<ProductResultDto>>> FilterProductAsync(GridInfo grid)
        {
            IQueryable<Product> query = _productRepo.TableNoTracking.Include(p => p.Seller);

            if (!string.IsNullOrWhiteSpace(grid.KeyWord))
            {
                query = query.Where(p => p.ProductName.ToLower().Contains(grid.KeyWord.ToLower()));
            }

            var totalRecord = await query.CountAsync();

            var products = await query
                .OrderByDescending(p => p.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .ToListAsync();

            var result = products.Select(p => new ProductResultDto
            {
                Id = p.Id,
                SellerId = p.SellerId,
                ProductName = p.ProductName,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                Status = p.Status,
                Image = p.Image
            }).ToList();

            return MethodResult<List<ProductResultDto>>.ResultWithData(result, "Lấy danh sách thành công", totalRecord);
        }

        // Thêm sản phẩm mới
        public async Task<IMethodResult<ProductResultDto>> InsertProductAsync(ProductResultDto dto)
        {
            var isExisted = await _productRepo.TableNoTracking
                .AnyAsync(p => p.ProductName.ToLower() == dto.ProductName.ToLower());

            if (isExisted)
            {
                return MethodResult<ProductResultDto>.ResultWithError("Sản phẩm đã tồn tại");
            }

            var product = new Product
            {
                Id = Guid.NewGuid(),
                SellerId = dto.SellerId,
                ProductName = dto.ProductName,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                Status = dto.Status,
                Image = dto.Image
            };

            await _productRepo.AddAsync(product);

            return MethodResult<ProductResultDto>.ResultWithData(null,"Tạo sản phẩm thành công");
        }

        // Cập nhật sản phẩm
        public async Task<IMethodResult<ProductResultDto>> UpdateProductAsync(Guid productId, ProductResultDto dto)
        {
            var product = await _productRepo.GetByIdAsync(productId);
            if (product == null)
            {
                return MethodResult<ProductResultDto>.ResultWithError("Không tìm thấy sản phẩm");
            }

            product.ProductName = dto.ProductName;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.StockQuantity = dto.StockQuantity;
            product.Status = dto.Status;
            product.Image = dto.Image;

            await _productRepo.UpdateAsync(product);

            return MethodResult<ProductResultDto>.ResultWithData(null,"Cập nhật sản phẩm thành công");
        }

        // Xóa sản phẩm
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
