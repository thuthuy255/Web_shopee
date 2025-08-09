using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.User;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IUserServices : IBaseService<User>
    {
        Task<MethodResult<List<UserDto>>> FilterUsersAsync(GridInfo grid);
        Task<MethodResult<List<UserDto>>> FilterSellerAsync(GridInfo grid);
        Task<IMethodResult<UserDto>> UpdateUserAsync(UserUpdateRequestDTO dto);
        Task<IMethodResult<bool>> DeleteUserAsync(Guid userId);
    }
}
