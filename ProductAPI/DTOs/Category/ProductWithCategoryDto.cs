namespace ProductAPI.DTOs.Product
{
    public class ProductWithCategoryDto
    {
        // Thông tin sản phẩm
        public Guid Id { get; set; }
        public string ProductName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;

        public bool SellerStatus { get; set; } = true;
        public string Thumbnail { get; set; } = null!;
        public List<string> ProductImages { get; set; } = new();

        public string Avatar { get; set;  }
        // Thông tin danh mục
        public Guid? CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? CategoryDescription { get; set; }
        public string? CategoryImageUrl { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public List<ProductVariantDto> Variants { get; set; } = new();

        public string? SellerName { get; set; }
        public string? SellerId { get; set; }
    }
}
