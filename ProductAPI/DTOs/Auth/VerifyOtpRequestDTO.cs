namespace ProductAPI.DTOs.Auth
{
    public class VerifyOtpRequestDTO
    {
        public string Email {  get; set; }
        public string Otp {  get; set; }
    }
}
