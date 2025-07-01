using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Auth;
using ProductAPI.IServices;
using ProductAPI.Constant;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthServices _authServices;

        public AuthController(IAuthServices authServices)
        {
            _authServices = authServices;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            var result = await _authServices.LoginAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
        {
            var result = await _authServices.RegisterUserAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("register-by-admin")]
        public async Task<IActionResult> RegisterByAdmin([FromBody] RegisterRequestDTO request)
        {
            var result = await _authServices.RegisterByAdminAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> SendOtp([FromBody] ForgotPasswordRequestDTO dto)
        {
            var result = await _authServices.SendOtpAsync(dto.Email);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtpAsync([FromBody] VerifyOtpRequestDTO dto)
        {
            var result = await _authServices.VerifyOtpAsync(dto.Email, dto.Otp);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPasswordAsync([FromBody] ResetPasswordDTO dto)
        {
            var result = await _authServices.ResetPasswordAsync(dto.Email, dto.NewPassword);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("toggle-lock/{userId}")]
        public async Task<IActionResult> ToggleLock(Guid userId)
        {
            var result = await _authServices.ToggleUserLockAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
