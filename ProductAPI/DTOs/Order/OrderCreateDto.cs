namespace ProductAPI.DTOs.Order
{
    public class OrderCreateDto
    {
        public Guid AddressId { get; set; }
        public string? PromotionCode { get; set; }
        public string? PaymentMethod { get; set; }
    }

}

