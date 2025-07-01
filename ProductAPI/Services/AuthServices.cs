using Azure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using ProductAPI.Core;
using ProductAPI.DTOs.Auth;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using System.Reflection.Metadata;
using ProductAPI.Constant;
namespace ProductAPI.Services
{
    public class AuthService : IAuthServices
    {
        private readonly IRepository<User> _userRepo;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private readonly IUserPrincipalService _userPrincipalService;

        public AuthService(IRepository<User> userRepo, IJwtTokenService jwtTokenService, IMemoryCache cache, IEmailService emailService, IUserPrincipalService userPrincipalService)
        {
            _cache = cache;
            _emailService = emailService;
            _userRepo = userRepo;
            _jwtTokenService = jwtTokenService;
            _userPrincipalService = userPrincipalService;
        }
        public async Task<IMethodResult<LoginResponseDTO>> LoginAsync(LoginRequestDTO request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return MethodResult<LoginResponseDTO>.ResultWithError("Email hoặc mật khẩu không được để trống.");
            }

            var user = await _userRepo.Table.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return MethodResult<LoginResponseDTO>.ResultWithError("Email không tồn tại.");
            }

            // Kiểm tra mật khẩu
            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return MethodResult<LoginResponseDTO>.ResultWithError("Mật khẩu không đúng.");
            }

            var response = new LoginResponseDTO
            {
                Token = _jwtTokenService.GenerateToken(user),
            };

            return MethodResult<LoginResponseDTO>.ResultWithData(response, "Đăng nhập thành công");
        }

        public async Task<IMethodResult<bool>> RegisterUserAsync(RegisterRequestDTO request)
        {
            var existingUser = await _userRepo.Table
                .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Email);
            if (existingUser != null)
            {
                return MethodResult<bool>.ResultWithError(Constants.MESS_AlreadyExists);
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                Phone = request.Phone,
                PasswordHash = passwordHash,
                Role = Constants.ROLE_USER,
                IsLocked = false,
                Created = DateTime.UtcNow,
                Modified = DateTime.UtcNow
            };

            await _userRepo.AddAsync(newUser);
            return MethodResult<bool>.ResultWithData(true, "Đăng ký người dùng thành công");
        }
        public async Task<IMethodResult<bool>> RegisterByAdminAsync(RegisterRequestDTO request)
        {
            var currentRole = _userPrincipalService.GetRoleUser();
            if (currentRole != Constants.ROLE_ADMIN)
            {
                return MethodResult<bool>.ResultWithError("Bạn không có quyền tạo tài khoản.");
            }


            var existingUser = await _userRepo.Table
                .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Email);
            if (existingUser != null)
            {
                return MethodResult<bool>.ResultWithError(Constants.MESS_AlreadyExists);
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                Phone = request.Phone,
                PasswordHash = passwordHash,
                IsLocked = false,
                Role = "Seller",
                Created = DateTime.UtcNow,
                Modified = DateTime.UtcNow
            };

            await _userRepo.AddAsync(newUser);
            return MethodResult<bool>.ResultWithData(true, $"Tạo tài khoản thành công");
        }

        public async Task<IMethodResult<bool>> SendOtpAsync(string email)
        {
            var requestEmail = await _userRepo.Table.FirstOrDefaultAsync(u => u.Email == email);
            if (requestEmail == null)
            {
                return MethodResult<bool>.ResultWithData(false, "Không tìm thấy người dùng");
            }
            var otp = new Random().Next(100000, 999999).ToString();

            _cache.Set(email, otp, TimeSpan.FromMinutes(5));

            await _emailService.SendEmailAsync(email, "Mã OTP xác minh", $"Mã OTP của bạn là: {otp}");

            return MethodResult<bool>.ResultWithData(true, "OTP đã được gửi qua email.");
        }
        public async Task<IMethodResult<bool>> VerifyOtpAsync(string email, string otp)
        {
            if (_cache.TryGetValue(email, out string cachedOtp))
            {
                if (cachedOtp == otp)
                {
                    return MethodResult<bool>.ResultWithData(true, "OTP chính xác.");
                }
            }
            return MethodResult<bool>.ResultWithError("OTP không đúng hoặc đã hết hạn.");
        }
        public async Task<IMethodResult<bool>> ResetPasswordAsync(string email, string newPassword)
        {
            var user = await _userRepo.Table.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return MethodResult<bool>.ResultWithError("Email không tồn tại.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.Modified = DateTime.UtcNow;

            await _userRepo.UpdateAsync(user); // ✅ Đừng quên await

            return MethodResult<bool>.ResultWithData(true, "Đặt lại mật khẩu thành công.");
        }

        public async Task<IMethodResult<bool>> ToggleUserLockAsync(Guid userId)
        {
            var roleUser = _userPrincipalService.GetRoleUser();
            if (roleUser != Constants.ROLE_ADMIN)
            {
                return MethodResult<bool>.ResultWithError("Bạn không có quyền thực hiện hành động này.");
            }

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return MethodResult<bool>.ResultWithError(Constants.MESS_NotFound);
            }

            user.IsLocked = !user.IsLocked;
            user.MarkDirty(nameof(user.IsLocked));
            await _userRepo.UpdateAsync(user);

            var message = user.IsLocked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.";
            return MethodResult<bool>.ResultWithData(true, message);
        }
    }



}