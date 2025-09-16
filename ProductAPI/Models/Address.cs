using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductAPI.Models
{
    public class Address : BaseEntity
    {
        [Required, StringLength(255)]
        public string AddressDetail { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string Province { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = false;

        // ✅ Thêm trường Tên & SĐT người nhận
        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        // 🔗 Quan hệ với User
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public User? User { get; set; }
    }
}
