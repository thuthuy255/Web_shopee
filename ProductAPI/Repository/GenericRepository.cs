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
            entity.Created = DateTime.UtcNow;
            entity.Modified = DateTime.UtcNow;

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
            var now = DateTime.UtcNow;
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

        public async Task UpdateAsync(T entity)
        {
            // Cập nhật thông tin audit
            entity.Modified = DateTime.UtcNow;
            var userId = _userService.GetUserId();
            if (userId.HasValue)
            {
                entity.ModifiedBy = userId.Value;
            }

            _dbSet.Attach(entity);
            var entry = _context.Entry(entity);

            // Lấy danh sách các property đã đánh dấu "dirty"
            var dirtyProperties = entity.GetDirtyProperties()?.ToList() ?? new List<string>();

            // Luôn update các trường Modified & ModifiedBy
            dirtyProperties.Add(nameof(entity.Modified));
            dirtyProperties.Add(nameof(entity.ModifiedBy));

            // Đánh dấu các property là IsModified = true
            foreach (var propertyName in dirtyProperties.Distinct())
            {
                if (propertyName != nameof(entity.Id)) // Không update Id
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
