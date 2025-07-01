using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.User;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;

namespace ProductAPI.Services
{
    public class UserServices : BaseService<User> , IUserServices
    {
        private readonly IRepository<User> _userRepo;

        public UserServices(IRepository<User> userRepo) : base(userRepo) 
        {
            _userRepo = userRepo;
        }
        public async Task<MethodResult<List<User>>> FilterUsersAsync(GridInfo grid)
        {
            var query = _userRepo.TableNoTracking;
            if (grid.KeyWord != null) 
            {
                query = query.Where(u =>u.Username.ToLower().Contains(grid.KeyWord) || u.Email.ToLower().Contains(grid.KeyWord));
            }
            var totalRecord = await query.CountAsync();
            var result = new List<User>();
            result= await query
                            .OrderByDescending(u=>u.Created)
                            .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                            .Take(grid.PageInfo.PageSize)
                            .ToListAsync();
            return MethodResult<List<User>>.ResultWithData(result, "Lấy danh sách thành công", totalRecord);
        }
        public async Task<IMethodResult<User>> UpdateUserAsync(UserUpdateRequestDTO dto)
        {
            var existingUser = await _userRepo.GetByIdAsync(dto.Id);
            if(existingUser == null)
            {
                return MethodResult<User>.ResultWithError("Không tìm thấy người dùng");
            }
            existingUser.FullName = dto.FullName;
            existingUser.Username = dto.Username;
            existingUser.Email = dto.Email;
            existingUser.Phone = dto.Phone;
            existingUser.IsLocked = dto.IsLocked;

            // Đánh dấu dirty thủ công nếu bạn không override trong entity
            existingUser.MarkDirty(nameof(existingUser.FullName));
            existingUser.MarkDirty(nameof(existingUser.Username));
            existingUser.MarkDirty(nameof(existingUser.Phone));
            existingUser.MarkDirty(nameof(existingUser.IsLocked));
            existingUser.MarkDirty(nameof(existingUser.Email));
            await _userRepo.UpdateAsync(existingUser);
            return MethodResult<User>.ResultWithData(existingUser, "Cập nhật thành công.");
        }
        public async Task<IMethodResult<bool>> DeleteUserAsync(Guid userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return MethodResult<bool>.ResultWithError("Không tìm thấy người dùng.");
            }

            await _userRepo.DeleteAsync(user);

            return MethodResult<bool>.ResultWithData(true, "Xóa người dùng thành công.");
        }


    }
}
