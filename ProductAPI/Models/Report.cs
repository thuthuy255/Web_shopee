using System;
using System.ComponentModel.DataAnnotations;

namespace ProductAPI.Models
{
    public class Report : BaseEntity
    {
        public Guid ReporterId { get; set; }

        [StringLength(20)]
        public string ReportedType { get; set; } = string.Empty; // VD: "User", "Product", "Review"

        public Guid ReportedId { get; set; } // Id của thực thể bị báo cáo (UserId, ProductId,...)

        public string Reason { get; set; } = string.Empty;

        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Resolved

        // 🔗 Quan hệ
        public User? Reporter { get; set; }
    }
}
