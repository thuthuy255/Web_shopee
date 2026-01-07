using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ProductAPI.Data;
using ProductAPI.IRepository;
using ProductAPI.Models;
using ProductAPI.IServices;

namespace ProductAPI.Repository
{
    public class EfRepository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly ApplicationDbContext _context;
        protected readonly IUserPrincipalService _userService;
        protected readonly DbSet<T> _dbSet;

        public EfRepository(ApplicationDbContext context, IUserPrincipalService userService)
        {
            _context = context;
            _userService = userService;
            _dbSet = context.Set<T>();
        }

        public IQueryable<T> Table => _dbSet.Where(e => !e.IsDeleted);
        public IQueryable<T> TableNoTracking => _dbSet.AsNoTracking().Where(e => !e.IsDeleted);

        public async Task<T?> GetByIdAsync(Guid id)
        {
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
        }
        public async Task AddAsync(T entity)
        {
            entity.Id = Guid.NewGuid();
            entity.Created = DateTime.Now;
            entity.Modified = DateTime.Now;

            var userId = _userService.GetUserId();
            if (userId.HasValue)
            {
                entity.CreatedBy = userId.Value;
                entity.ModifiedBy = userId.Value;
            }

            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            var now = DateTime.Now;
            var userId = _userService.GetUserId();

            foreach (var entity in entities)
            {
                entity.Id = Guid.NewGuid();
                entity.Created = now;
                entity.Modified = now;
                if (userId.HasValue)
                {
                    entity.CreatedBy = userId;
                    entity.ModifiedBy = userId;
                }
            }

            await _dbSet.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
        }
        public Task SaveChangesAsync() => _context.SaveChangesAsync();

        public async Task UpdateAsync(T entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));

            // Cập nhật thông tin audit
            entity.Modified = DateTime.Now;
            var userId = _userService.GetUserId();
            if (userId.HasValue)
            {
                entity.ModifiedBy = userId.Value;
            }

            // Kiểm tra xem entity đã được tracked chưa
            var local = _context.Set<T>().Local.FirstOrDefault(e => e.Id == entity.Id);
            if (local != null)
            {
                _context.Entry(local).State = EntityState.Detached;
            }

            var entry = _context.Entry(entity);

            // Nếu chưa được attach thì mới attach
            if (entry.State == EntityState.Detached)
            {
                _context.Set<T>().Attach(entity);
            }

            // Lấy danh sách các property đã đánh dấu "dirty"
            var dirtyProperties = entity.GetDirtyProperties()?.ToList() ?? new List<string>();
            dirtyProperties.Add(nameof(entity.Modified));
            dirtyProperties.Add(nameof(entity.ModifiedBy));

            foreach (var propertyName in dirtyProperties.Distinct())
            {
                if (propertyName != nameof(entity.Id))
                {
                    entry.Property(propertyName).IsModified = true;
                }
            }

            await _context.SaveChangesAsync();
        }
        public async Task UpdateRangeAsync(IEnumerable<T> entities)
        {
            _dbSet.UpdateRange(entities);
            await _context.SaveChangesAsync();
        }



        public async Task DeleteAsync(T entity, bool hardDelete = false)
        {
            if (hardDelete)
            {
                _dbSet.Remove(entity);
            }
            else
            {
                entity.IsDeleted = true;
                entity.Modified = DateTime.UtcNow;
                var userId = _userService.GetUserId();
                if (userId.HasValue)
                {
                    entity.ModifiedBy = userId.Value;
                }

                _dbSet.Attach(entity);
                var entry = _context.Entry(entity);
                entry.Property(nameof(entity.IsDeleted)).IsModified = true;
                entry.Property(nameof(entity.Modified)).IsModified = true;
                entry.Property(nameof(entity.ModifiedBy)).IsModified = true;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteRangeAsync(IEnumerable<T> entities, bool hardDelete = false)
        {
            foreach (var entity in entities)
            {
                await DeleteAsync(entity, hardDelete);
            }
        }
    }
}
