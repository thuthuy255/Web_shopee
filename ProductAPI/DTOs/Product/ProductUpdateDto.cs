namespace ProductAPI.DTOs.Product
{
    public class ProductUpdateDto
    {
        public string ProductName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Status { get; set; } = null!;
        public string Thumbnail { get; set; } = null!;
        public List<string>? ProductImages { get; set; } = new(); // ảnh chi tiết nếu cần
        public List<ProductVariantDto>? Variants { get; set; }
    }
}
