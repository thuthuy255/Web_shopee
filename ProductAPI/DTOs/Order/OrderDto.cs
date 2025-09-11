using ProductAPI.Data.Enums;
using static ProductAPI.Data.Enums.Enums;

namespace ProductAPI.DTOs.Order
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid? AddressId { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public string? PromotionCode { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }
}
