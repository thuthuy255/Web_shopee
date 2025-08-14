namespace ProductAPI.DTOs.CartItem
{
    public class CartItemDetailDto
    {
        public Guid Id { get; set; }
        public int Quantity { get; set; }
        public bool IsSelected { get; set; }

        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string? Thumbnail { get; set; }

        public Guid? ProductVariantId { get; set; }
        public int StockQuantity { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public decimal Price { get; set; }
        public string FullName { get; set; }
        public Guid SellerId { get; set; }
    }
}
