namespace ProductAPI.Models
{
    public class ProductVariant : BaseEntity
    {
        public Guid ProductId { get; set; }

        // Tên biến thể (VD: "Màu sắc", "Kích thước")
        public string? VariantName { get; set; }

        // Giá trị biến thể (VD: "Đỏ", "Xanh", "M", "L")
        public string? VariantValue { get; set; }

        // Giá bán cho biến thể này
        public decimal Price { get; set; }

        // Số lượng tồn kho cho biến thể này
        public int StockQuantity { get; set; }

        // Ảnh riêng cho biến thể (nếu có)
        public string? ImageUrl { get; set; }

        // Navigation
        public Product Product { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
