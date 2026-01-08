using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.Product;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IProductService : IBaseService<Product>
    {
        Task<MethodResult<List<ProductWithCategoryDto>>> FilterProductAsync(GridInfo grid);
        Task<IMethodResult<List<ProductWithCategoryDto>>> FilterProductBySellerAsync(Guid sellerId, GridInfo grid);
        Task<IMethodResult<List<ProductWithCategoryDto>>> getAllListProducts(Guid sellerId, SearchProducts request);

        Task<IMethodResult<SellerProductListDto>> GetShopWithProductsAsync(Guid sellerId, GridInfo grid);
        Task<MethodResult<int>> GetTotalProductAsync();

        Task<IMethodResult<ProductResultDto>> CreateProductFromFormAsync(ProductFormDataDto dto, Guid sellerId);
        Task<IMethodResult<ProductResultDto>> UpdateProductFromFormAsync(Guid productId, ProductFormDataDto dto);
        Task<MethodResult<List<ProductWithCategoryDto>>> GetProductsByCategoryAsync(Guid categoryId, GridInfo grid);

        Task<IMethodResult<bool>> DeleteProductAsync(Guid productId);
        Task<IMethodResult<ProductResultDto>> GetByIdAsync(Guid productId);
        Task<IMethodResult<bool>> DeleteVariantAsync(Guid variantId);
    }
}
