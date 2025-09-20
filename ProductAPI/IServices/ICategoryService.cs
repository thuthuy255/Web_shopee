using ProductAPI.Core;
using ProductAPI.DTOs.Category;
using ProductAPI.DTOs.Common;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface ICategoryService : IBaseService<Category>
    {
        Task<MethodResult<List<CategoryDto>>> GetAllAsync(GridInfo gridInfo);
        Task<IMethodResult<List<CategoryDto>>> GetBySellerAsync(GridInfo grid);
        Task<MethodResult<int>> GetTotalCategoryAsync();

        Task<IMethodResult<CategoryDto>> CreateAsync(CreateCategoryDto dto);
        Task<IMethodResult<CategoryDto>> UpdateAsync(Guid id, UpdateCategoryDto dto);
        Task<IMethodResult<bool>> DeleteAsync(Guid id);
    }

}
