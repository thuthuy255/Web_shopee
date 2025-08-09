public class ProductCreateDto
{
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } 
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Status { get; set; } = "Available";
    public string Thumbnail { get; set; } = string.Empty; // ảnh đại diện
    public List<string>? ProductImages { get; set; } // ảnh chi tiết (nhiều)
}
