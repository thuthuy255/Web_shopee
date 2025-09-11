using ProductAPI.Core;
using ProductAPI.DTOs.Product;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IProductVariantService : IBaseService<ProductVariant>
    {
        Task<IMethodResult<List<ProductVariantDto>>> GetByProductIdAsync(Guid productId);
        Task<IMethodResult<List<ProductVariantDto>>> AddVariantsAsync(List<CreateProductVariantDto> variants);
        Task<IMethodResult<ProductVariantDto>> UpdateVariantAsync(UpdateProductVariantDto dto);
        
    }
}
