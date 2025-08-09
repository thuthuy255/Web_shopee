using ProductAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Product : BaseEntity
{
    public Guid SellerId { get; set; }

    [Required, StringLength(255)]
    public string ProductName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = "Available";

    [StringLength(255)]
    public string Thumbnail { get; set; } = string.Empty;

    [StringLength(255)]
    public string? ImageListJson { get; set; }

    public Guid? CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; }

    public User? Seller { get; set; }
    public ICollection<CartItem>? CartItems { get; set; }
    public ICollection<ProductVariant> ProductVariants { get; set; }

    public ICollection<OrderItem>? OrderItems { get; set; }
    public ICollection<Review>? Reviews { get; set; }
}
