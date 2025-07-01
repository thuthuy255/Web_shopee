using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.Product;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IProductService : IBaseService<Product>
    {
        Task<MethodResult<List<ProductResultDto>>> FilterProductAsync(GridInfo grid);
        Task<IMethodResult<ProductResultDto>> UpdateProductAsync(Guid productId, ProductResultDto dto);
        Task<IMethodResult<ProductResultDto>> InsertProductAsync(ProductResultDto dto);
        Task<IMethodResult<bool>> DeleteProductAsync(Guid productId);
    }
}
