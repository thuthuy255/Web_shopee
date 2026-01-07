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
        private readonly CloudinaryService _cloudService;


        public UserServices(IRepository<User> userRepo, CloudinaryService cloudService) : base(userRepo)
        {
            _userRepo = userRepo;
            _cloudService = cloudService;
        }
        public async Task<MethodResult<List<UserDto>>> FilterUsersAsync(GridInfo grid)
        {
            var query = _userRepo.TableNoTracking;

            // Tìm kiếm theo từ khóa nếu có
            if (!string.IsNullOrEmpty(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(u =>
                    u.Username.ToLower().Contains(keyword) ||
                    u.Email.ToLower().Contains(keyword));
            }

            query = query.Where(u => u.Role == Constant.Constants.ROLE_USER);

            // Đếm tổng bản ghi
            var totalRecord = await query.CountAsync();
            if (totalRecord == 0)
            {
                return MethodResult<List<UserDto>>.ResultWithError("Không tìm thấy người dùng nào");
            }
            // Truy vấn và ánh xạ sang DTO
            var result = await query
                .OrderByDescending(u => u.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    Phone = u.Phone,
                    Role = u.Role,
                    IsLocked = u.IsLocked,
                    Created = u.Created
                })
                .ToListAsync();

            return MethodResult<List<UserDto>>.ResultWithData(result, "Lấy danh sách thành công", totalRecord);
        }
        public async Task<MethodResult<List<UserDto>>> FilterSellerAsync(GridInfo grid)
        {
            var query = _userRepo.TableNoTracking;

            // Tìm kiếm theo từ khóa nếu có
            if (!string.IsNullOrEmpty(grid.KeyWord))
            {
                var keyword = grid.KeyWord.ToLower();
                query = query.Where(u =>
                    u.Username.ToLower().Contains(keyword) ||
                    u.Email.ToLower().Contains(keyword) ||
                    u.FullName.ToLower().Contains(keyword) ||
                    u.Phone.ToLower().Contains(keyword) ||
                    u.Role.ToLower().Contains(keyword));
               
            }


            // Lọc Role = "User"
            query = query.Where(u => u.Role == Constant.Constants.ROLE_SELLER);

            // Đếm tổng bản ghi
            var totalRecord = await query.CountAsync();

            // Truy vấn và ánh xạ sang DTO
            var result = await query
                .OrderByDescending(u => u.Created)
                .Skip((grid.PageInfo.Page - 1) * grid.PageInfo.PageSize)
                .Take(grid.PageInfo.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    Phone = u.Phone,
                    Role = u.Role,
                    IsLocked = u.IsLocked,
                    Created = u.Created
                })
                .ToListAsync();

            return MethodResult<List<UserDto>>.ResultWithData(result, "Lấy danh sách thành công", totalRecord);
        }
        public async Task<IMethodResult<UserDto>> UpdateUserAsync(UserUpdateRequestDTO dto)
        {
            var existingUser = await _userRepo.GetByIdAsync(dto.Id);
            if (existingUser == null)
            {
                return MethodResult<UserDto>.ResultWithError("Không tìm thấy người dùng");
            }
            if (existingUser.Email != dto.Email)
            {
                var emailExists = await _userRepo.TableNoTracking
                    .AnyAsync(u => u.Email == dto.Email && u.Id != dto.Id);
                if (emailExists)
                {
                    return MethodResult<UserDto>.ResultWithError("Email đã tồn tại!");
                }

                existingUser.Email = dto.Email;
                existingUser.MarkDirty(nameof(existingUser.Email));
            }
            // Cập nhật các trường cần thiết
            existingUser.FullName = dto.FullName;
            existingUser.Username = dto.Username;
            existingUser.Phone = dto.Phone;
            existingUser.IsLocked = dto.IsLocked || false;
            if (dto.Avatar != null)
            {
                var url = await _cloudService.UploadImageAsync(dto.Avatar);
                existingUser.Avatar = url; // Lưu URL cloud vào DB
            }
            existingUser.MarkDirty(nameof(existingUser.FullName));
            existingUser.MarkDirty(nameof(existingUser.Username));
            existingUser.MarkDirty(nameof(existingUser.Phone));
            existingUser.MarkDirty(nameof(existingUser.IsLocked));
            existingUser.MarkDirty(nameof(existingUser.Avatar));

            await _userRepo.UpdateAsync(existingUser);

            var updatedDto = new UserDto
            {
                FullName = existingUser.FullName,
                Username = existingUser.Username,
                Email = existingUser.Email,
                Phone = existingUser.Phone,
                Role = existingUser.Role,
                IsLocked = existingUser.IsLocked,
                Avatar=existingUser.Avatar,
                Created = existingUser.Created
            };

            return MethodResult<UserDto>.ResultWithData(updatedDto, "Cập nhật thành công.");
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
