using ProductAPI.Models;

public class CartItem : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid ProductId { get; set; }

    public Guid? ProductVariantId { get; set; }

    public int Quantity { get; set; }

    public bool IsSelected { get; set; } = false;

    public User? User { get; set; }
    public Product? Product { get; set; }
    public ProductVariant? ProductVariant { get; set; }
}
