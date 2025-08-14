namespace ProductAPI.DTOs.Auth
{
    public class UserInfoDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsLocked { get; set; }
        public string? Avatar { get; set; }
        public string? UserName { get; set; }
        public string? Phone {  get; set; }
    }
}
