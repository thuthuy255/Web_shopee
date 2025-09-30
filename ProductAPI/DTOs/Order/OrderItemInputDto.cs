namespace ProductAPI.DTOs.Order
{
    public class OrderItemInputDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
