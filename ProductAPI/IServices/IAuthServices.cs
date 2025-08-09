using ProductAPI.Core;
using ProductAPI.DTOs.Auth;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IAuthServices
    {
        Task<IMethodResult<LoginResponseDTO>> LoginAsync(LoginRequestDTO request);

        Task<IMethodResult<bool>> RegisterUserAsync(RegisterRequestDTO request);

        Task<IMethodResult<bool>> RegisterByAdminAsync(RegisterRequestDTO request);

        Task<IMethodResult<bool>> SendOtpAsync(string email);
        Task<IMethodResult<bool>> VerifyOtpAsync(string email, string otp);

        Task<IMethodResult<bool>> ResetPasswordAsync(string email, string newPassword);

        Task<IMethodResult<bool>> ToggleUserLockAsync(Guid userId);
        Task<IMethodResult<UserInfoDto>> GetInfoUser();
    }
}
