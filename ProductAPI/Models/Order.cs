using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static ProductAPI.Data.Enums.Enums;

namespace ProductAPI.Models
{
    public class Order : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid? AddressId { get; set; }

        [StringLength(20)]
        public string? PromotionCode { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }


        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;


        public string? TxnRef { get; set; } // Mã giao dịch VNPAY

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        // 🔗 Navigation properties
        public User? User { get; set; }
        public Address? Address { get; set; }
        public ICollection<OrderItem>? OrderItems { get; set; }
    }
}
