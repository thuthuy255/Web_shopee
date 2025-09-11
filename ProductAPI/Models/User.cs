using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class User : BaseEntity
    {
        [StringLength(50)]
        public string? Username { get; set; }   // cho phép null

        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(255)]
        public string? FullName { get; set; }   // cho phép null

        [Required, StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Avatar { get; set; }     // cho phép null

        [Required, StringLength(20)]
        public string Role { get; set; } = "Customer";

        public bool IsLocked { get; set; }

        public ICollection<Address>? Addresses { get; set; }
        public ICollection<Product>? Products { get; set; }
        public ICollection<CartItem>? CartItems { get; set; }
        public ICollection<Order>? Orders { get; set; }
        public ICollection<Review>? Reviews { get; set; }
        public ICollection<Report>? Reports { get; set; }
        public ICollection<Promotion>? Promotions { get; set; }
    }
}
