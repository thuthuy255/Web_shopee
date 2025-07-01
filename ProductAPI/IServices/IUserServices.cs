using ProductAPI.Core;
using ProductAPI.DTOs.Common;
using ProductAPI.DTOs.User;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IUserServices : IBaseService<User>
    {
        Task<MethodResult<List<User>>> FilterUsersAsync(GridInfo grid);
        Task<IMethodResult<User>> UpdateUserAsync(UserUpdateRequestDTO dto);
        Task<IMethodResult<bool>> DeleteUserAsync(Guid userId);
    }
}
