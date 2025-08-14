namespace ProductAPI.DTOs.CartItem
{
    public class SellerCartItemsDto
    {
        public Guid SellerId { get; set; }
        public string SellerName { get; set; }
        public List<CartItemDetailDto> Items { get; set; }
    }
}
