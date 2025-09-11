using System.ComponentModel.DataAnnotations;

public class RegisterRequestDTO
{
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password là bắt buộc")]
    [MinLength(8, ErrorMessage = "Password phải có ít nhất 8 ký tự")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$",
        ErrorMessage = "Password phải có ít nhất 8 ký tự, chứa 1 chữ hoa, 1 số và 1 ký tự đặc biệt")]
    public string Password { get; set; }

    public string? Username { get; set; }

    public string? FullName { get; set; }

    [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string Phone { get; set; }

    public string? Avatar { get; set; }
}
