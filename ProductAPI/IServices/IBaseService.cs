using ProductAPI.Core;

namespace ProductAPI.IServices
{
    public partial interface IBaseService<T>
    {
        Task<IMethodResult<IEnumerable<T>>> GetAllAsync();
       
        Task<IMethodResult<T>> GetByIdAsync(Guid id);
        Task<IMethodResult<Guid>> InsertAsync(T model);
        Task<IMethodResult<T>> UpdateAsync(T model);
        Task<IMethodResult<bool>> DeleteAsync(Guid id);
        //Task<IMethodResult<bool>> DeleteMuiltipleAsync(List<Guid> id);
        Task<IMethodResult<bool>> HardDeleteAsync(Guid id);
        //Task<IMethodResult<bool>> HardDeleteMuiltipleAsync(List<Guid> id);

    }
}
