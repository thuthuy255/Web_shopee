using System.ComponentModel.DataAnnotations.Schema;
using ProductAPI.Data.Enums;
using static ProductAPI.Data.Enums.Enums;

namespace ProductAPI.Models
{
    public class Payment : BaseEntity
    {
        public Guid OrderId { get; set; }

        public Guid UserId { get; set; }
        public User User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string TxnRef { get; set; } // Mã giao dịch VNPAY

        public PaymentStatus Status { get; set; } // enum -> int
    }
}
