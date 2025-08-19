using System.ComponentModel.DataAnnotations;

public class RegisterRequestDTO
{
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password là bắt buộc")]
    [MinLength(6, ErrorMessage = "Password ít nhất 6 ký tự")]
    public string Password { get; set; }

    [Required]
    public string Username { get; set; }

    [Required]
    public string FullName { get; set; }

    [Required]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string Phone { get; set; }
    public string? Avatar { get; set; }

}
