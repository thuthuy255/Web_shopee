using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class Product : BaseEntity
    {
        public Guid SellerId { get; set; }

        [Required, StringLength(255)]
        public string ProductName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Available"; // VD: Available, OutOfStock, Hidden...

        [StringLength(255)]
        public string Image { get; set; } = string.Empty;

        // 🔗 Navigation properties
        public User? Seller { get; set; }
        public ICollection<CartItem>? CartItems { get; set; }
        public ICollection<OrderItem>? OrderItems { get; set; }
        public ICollection<Review>? Reviews { get; set; }
    }
}
