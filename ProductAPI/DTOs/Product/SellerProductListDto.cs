namespace ProductAPI.DTOs.Product
{
    public class SellerProductListDto
    {
        public Guid SellerId { get; set; }
        public string SellerName { get; set; }
        public string SellerEmail { get; set; }
        public string? SellerAvatar { get; set; }

        public List<ProductWithCategoryDto> Products { get; set; } = new();
    }

}
