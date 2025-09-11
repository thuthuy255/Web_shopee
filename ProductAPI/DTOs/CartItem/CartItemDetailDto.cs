namespace ProductAPI.DTOs.CartItem
{
    public class CartItemDetailDto
    {
        public Guid Id { get; set; }
        public int Quantity { get; set; }
        public bool? IsSelected { get; set; }

        // Product info
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string? Thumbnail { get; set; }

        // Variant info
        public Guid? ProductVariantId { get; set; }
        public string? VariantName { get; set; }     // ví dụ: "Màu sắc", "Kích thước"
        public string? VariantValue { get; set; }   // ví dụ: "Đỏ", "M"
        public string? VariantImage { get; set; }   // ảnh riêng của biến thể
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }

        // Seller info
        public Guid SellerId { get; set; }
        public string FullName { get; set; }
    }
}
