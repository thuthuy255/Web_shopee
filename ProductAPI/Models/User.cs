using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class User : BaseEntity
    {
        [Required, StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string Role { get; set; } = "Customer"; // Có thể là Customer / Seller / Admin

        public bool IsLocked { get; set; } // 0: Đang hoạt động, 1: Đã khóa, v.v.

        // 🔁 Quan hệ
        public ICollection<Address>? Addresses { get; set; }
        public ICollection<Product>? Products { get; set; }
        public ICollection<CartItem>? CartItems { get; set; }
        public ICollection<Order>? Orders { get; set; }
        public ICollection<Review>? Reviews { get; set; }
        public ICollection<Report>? Reports { get; set; }
        public ICollection<Promotion>? Promotions { get; set; }
    }
}
