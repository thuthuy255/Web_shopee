namespace ProductAPI.DTOs.Category
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public Guid? SellerId { get; set; }
        public string? SellerName { get; set; }
    }
}
