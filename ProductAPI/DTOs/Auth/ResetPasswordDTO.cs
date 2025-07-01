namespace ProductAPI.DTOs.Auth
{
    public class ResetPasswordDTO
    {
        public string Email {  get; set; }
        public string NewPassword { get; set; }
    }
}
