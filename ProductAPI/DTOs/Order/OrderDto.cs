using ProductAPI.Data.Enums;
using static ProductAPI.Data.Enums.Enums;

namespace ProductAPI.DTOs.Order
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public Guid? AddressId { get; set; }
        public string? AddressDetail {  get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public string? TxnRef {  get; set; }
        public string? PromotionCode { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public List<OrderItemDto> OrderItems { get; set; } = new();
        public DateTime Created { get; set; }

    }
}
