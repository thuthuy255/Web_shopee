namespace ProductAPI.DTOs.Product
{
    public class UpdateProductVariantDto
    {
        public Guid Id { get; set; }
        public string? VariantName { get; set; }
        public string? VariantValue { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }  
        public IFormFile? ImageFile { get; set; } 
    }
}
