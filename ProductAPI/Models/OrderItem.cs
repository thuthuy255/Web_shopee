using System;

namespace ProductAPI.Models
{
    public class OrderItem : BaseEntity
    {
        public Guid OrderId { get; set; }

        public Guid ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        // 🔗 Navigation properties
        public Order? Order { get; set; }

        public Product? Product { get; set; }
    }
}
