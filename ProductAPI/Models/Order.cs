using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class Order : BaseEntity
    {
        public Guid UserId { get; set; }

        public Guid AddressId { get; set; }

        public decimal TotalAmount { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // VD: Pending, Paid, Cancelled, Delivered

        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        // 🔗 Navigation properties
        public User? User { get; set; }

        public Address? Address { get; set; }

        public ICollection<OrderItem>? OrderItems { get; set; }
    }
}
