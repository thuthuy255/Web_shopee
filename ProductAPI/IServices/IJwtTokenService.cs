using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
