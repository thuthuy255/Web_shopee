using ProductAPI.Models;
using ProductAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace ProductAPI.DAO
{
    public class UserDao
    {
        private readonly ApplicationDbContext _context;

        public UserDao(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách tất cả người dùng
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        // Lấy người dùng theo Email
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        // Lấy người dùng theo ID
        public async Task<User?> GetDetailByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        // Thêm người dùng
        public async Task<User> AddAsync(User user)
        {
            user.Created = DateTime.UtcNow;
            user.Modified = DateTime.UtcNow;
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // Cập nhật người dùng
        public async Task<User?> UpdateAsync(User user)
        {
            var existingUser = await _context.Users.FindAsync(user.Id);
            if (existingUser == null) return null;

            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.PasswordHash = user.PasswordHash;
            existingUser.Modified = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingUser;
        }
    }
}
