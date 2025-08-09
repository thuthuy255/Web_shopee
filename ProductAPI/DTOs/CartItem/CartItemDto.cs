namespace ProductAPI.DTOs.CartItem
{
    public class CartItemDto
    {
        public Guid ProductId { get; set; }         
        public Guid? ProductVariantId { get; set; }   
        public int Quantity { get; set; }
    }

}
