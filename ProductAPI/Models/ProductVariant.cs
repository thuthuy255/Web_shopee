namespace ProductAPI.Models
{
    public class ProductVariant : BaseEntity
    {
    
        public Guid ProductId { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }


        public Product Product { get; set; } // Navigation property
    }

}
