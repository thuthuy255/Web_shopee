using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductAPI.Models
{
    public class CartItem : BaseEntity
    {
        public Guid UserId { get; set; }

        public Guid ProductId { get; set; }

        public int Quantity { get; set; }

        // 🔗 Navigation properties
        public User? User { get; set; }

        public Product? Product { get; set; }
    }
}
