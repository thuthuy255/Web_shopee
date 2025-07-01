using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using ProductAPI.Data;
using ProductAPI.IRepository;
using ProductAPI.Models;
using ProductAPI.IServices;
using ProductAPI.Core;
using ProductAPI.Constant;
namespace ProductAPI.Services
{
    public class BaseService<T> : IBaseService<T> where T : BaseEntity
    {
        private readonly IRepository<T> _repository;

        public BaseService(IRepository<T> repository)
        {
            _repository = repository;
        }

        // ✅ Get all (no tracking)
        public virtual async Task<IMethodResult<IEnumerable<T>>> GetAllAsync()
        {
            var data = await _repository.TableNoTracking.ToListAsync();
            return MethodResult<IEnumerable<T>>.ResultWithData(data);
        }

        // ✅ Get by ID
        public virtual async Task<IMethodResult<T>> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return MethodResult<T>.ResultWithData(entity);
        }

        // ✅ Soft delete 1 record
        public virtual async Task<IMethodResult<bool>> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return MethodResult<bool>.ResultWithError(Constant.Constants.MESS_NotFound);

            await _repository.DeleteAsync(entity);
            return MethodResult<bool>.ResultWithData(true);
        }

        // ✅ Soft delete many
        public virtual async Task<IMethodResult<bool>> DeleteMultipleAsync(List<Guid> ids)
        {
            if (ids == null || !ids.Any())
                return MethodResult<bool>.ResultWithError(Constant.Constants.MESS_NotFound);

            var entities = _repository.Table.Where(e => ids.Contains(e.Id)).ToList();
            if (!entities.Any())
                return MethodResult<bool>.ResultWithError(Constant.Constants.MESS_NotFound);

            await _repository.DeleteRangeAsync(entities);
            return MethodResult<bool>.ResultWithData(true);
        }

        // ✅ Hard delete 1 record
        public virtual async Task<IMethodResult<bool>> HardDeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return MethodResult<bool>.ResultWithError(Constant.Constants.MESS_NotFound);

            await _repository.DeleteAsync(entity, hardDelete: true);
            return MethodResult<bool>.ResultWithData(true);
        }

        // ✅ Hard delete many
        public virtual async Task<IMethodResult<bool>> HardDeleteMultipleAsync(List<Guid> ids)
        {
            if (ids == null || !ids.Any())
                return MethodResult<bool>.ResultWithError(Constant.Constants.MESS_NotFound);

            var entities = _repository.Table.Where(e => ids.Contains(e.Id)).ToList();
            if (!entities.Any())
                return MethodResult<bool>.ResultWithError("Không tìm thấy bản ghi nào để xóa.");

            await _repository.DeleteRangeAsync(entities, hardDelete: true);
            return MethodResult<bool>.ResultWithData(true);
        }

        // ✅ Insert
        public virtual async Task<IMethodResult<Guid>> InsertAsync(T model)
        {
            try
            {
                await _repository.AddAsync(model);
                return MethodResult<Guid>.ResultWithData(model.Id);
            }
            catch (Exception ex)
            {
                return MethodResult<Guid>.ResultWithError("Insert thất bại: " + ex.Message);
            }
        }

        // ✅ Update
        public virtual async Task<IMethodResult<T>> UpdateAsync(T model)
        {
            await _repository.UpdateAsync(model);
            return MethodResult<T>.ResultWithData(model);
        }
    }
}
