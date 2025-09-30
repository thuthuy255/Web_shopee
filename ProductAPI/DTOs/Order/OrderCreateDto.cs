namespace ProductAPI.DTOs.Order
{
    public class OrderCreateDto
    {
        public Guid AddressId { get; set; }
        public string? PromotionCode { get; set; }
        public string? PaymentMethod { get; set; }
        public List<Guid> CartItemIds { get; set; } = new();
        public List<OrderItemInputDto> Items { get; set; }
    }

}

