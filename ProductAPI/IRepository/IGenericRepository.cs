using System.Linq.Expressions;

namespace ProductAPI.IRepository
{
    public interface IRepository<T> where T : class
    {
        IQueryable<T> Table { get; }
        IQueryable<T> TableNoTracking { get; }

        Task<T?> GetByIdAsync(Guid id);
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task UpdateRangeAsync(IEnumerable<T> entities);

        Task DeleteAsync(T entity, bool hardDelete = false);
        Task DeleteRangeAsync(IEnumerable<T> entities, bool hardDelete = false);
    }
}
