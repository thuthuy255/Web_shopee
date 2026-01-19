namespace ProductAPI.DTOs.Product
{
    public class ProductResultDto
    {
        public Guid Id { get; set; }
        public string ProductName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;


        // Trạng thái do seller set: true = hoạt động, false = ngưng bán
        public bool SellerStatus { get; set; } = true;
        public string Thumbnail { get; set; } = null!;
        public Guid? CategoryId { get; set; }
        public Guid SellerId { get; set; }
        public string SellerName { get; set; }
        public DateTime Created { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? Modified { get; set; }
        public string? ModifiedBy { get; set; }
        public bool IsDeleted { get; set; }
        public string CategoryName { get; set; }

        public List<string>? ProductImages { get; set; } = new();
        public List<ProductVariantDto> ProductVariants { get; set; } = new();
        public string Avatar { get; set; }
    }
}
