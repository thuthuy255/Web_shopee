namespace ProductAPI.DTOs.Product
{
    public class ProductResultDto
    {
        public Guid Id { get; set; }
        public Guid SellerId { get; set; }
        public string ProductName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Status { get; set; } = null!;
        public string Image { get; set; } = null!;
    }

}
