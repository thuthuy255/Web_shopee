using System;

namespace ProductAPI.Models
{
    public class Review : BaseEntity
    {
        public Guid UserId { get; set; }

        public Guid ProductId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        // 🔗 Navigation properties
        public User? User { get; set; }

        public Product? Product { get; set; }
    }
}
