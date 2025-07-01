namespace ProductAPI.DTOs.User
{
    public class UserUpdateRequestDTO
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public string Role { get; set; } = "Customer";
        public bool IsLocked { get; set; } = false;
    }
}
