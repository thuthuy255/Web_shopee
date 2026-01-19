namespace ProductAPI.DTOs.Product
{
    public class ProductFormDataDto
    {
        public string? ProductName { get; set; } = null!;
        public string? Description { get; set; } = null!;
        public decimal? Price { get; set; }
        public int? StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;
        public bool RemoveImage { get; set; } = false;
        public bool SellerStatus { get; set; } = true; 
        public Guid? CategoryId { get; set; }
       

        public IFormFile? Thumbnail { get; set; }  // Ảnh đại diện
        public List<IFormFile>? ProductImages { get; set; }  // Ảnh chi tiết 
        public string? ExistingProductImages { get; set; } // JSON list giữ ảnh cũ

        public List<ProductVariantFormDto>? Variants { get; set; }
    }
}
