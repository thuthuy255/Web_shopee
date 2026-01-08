namespace ProductAPI.DTOs.User
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string? Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsLocked { get; set; }
        public DateTime Created { get; set; }
        public string Avatar { get; set; }
    }

}
