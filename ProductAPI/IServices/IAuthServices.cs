using ProductAPI.Core;
using ProductAPI.DTOs.Auth;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IAuthServices
    {
        Task<IMethodResult<LoginResponseDTO>> LoginAsync(LoginRequestDTO request);

        // Người dùng tự đăng ký (role mặc định là User)
        Task<IMethodResult<bool>> RegisterUserAsync(RegisterRequestDTO request);

        // Admin tạo tài khoản Seller hoặc Admin (role được chỉ định trong hàm, không từ client)
        Task<IMethodResult<bool>> RegisterByAdminAsync(RegisterRequestDTO request);

        // Xác thực email bằng OTP
        Task<IMethodResult<bool>> SendOtpAsync(string email);
        Task<IMethodResult<bool>> VerifyOtpAsync(string email, string otp);

        // Quên mật khẩu
        Task<IMethodResult<bool>> ResetPasswordAsync(string email, string newPassword);

        // Khóa / Mở khóa tài khoản (chỉ Admin)
        Task<IMethodResult<bool>> ToggleUserLockAsync(Guid userId);
    }
}
