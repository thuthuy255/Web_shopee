﻿namespace ProductAPI.DTOs.Auth
{
    public class RegisterRequestDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone {  get; set; } = string.Empty;

    }
}
