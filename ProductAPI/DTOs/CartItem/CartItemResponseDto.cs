namespace ProductAPI.DTOs.CartItem
{
    public class CartItemResponseDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public bool IsSelected { get; set; }

        public string ProductName { get; set; }
        public string? Thumbnail { get; set; }
        public decimal? Price { get; set; }
    }

}
