using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ProductAPI.IServices;

namespace ProductAPI.Services
{
    // Chỉ lấy những thông tin hiện tại của người dùng ví dụ như sau khi đăng nhập
    public class UserPrincipalService : IUserPrincipalService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserPrincipalService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? GetUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;

            if (user == null || !user.Identity?.IsAuthenticated == true)
                return null;

            var userIdClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userIdClaim == null || string.IsNullOrWhiteSpace(userIdClaim.Value))
                return null;

            return Guid.TryParse(userIdClaim.Value, out var userId) ? userId : null;
        }

        public string? GetRoleUser()
        {
            var user = _httpContextAccessor.HttpContext?.User;

            if (user == null || !user.Identity?.IsAuthenticated == true)
                return null;

            return user.FindFirst(ClaimTypes.Role)?.Value;
        }
    }
}
