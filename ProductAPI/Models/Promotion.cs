using ProductAPI.Models;
using System.ComponentModel.DataAnnotations;

public class Promotion : BaseEntity
{
    public Guid SellerId { get; set; }

    [Required, StringLength(50)]
    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal DiscountPercent { get; set; }

    public decimal? MinOrderValue { get; set; }

    public int? QuantityLimit { get; set; }

    public int UsedQuantity { get; set; } = 0;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = "Active"; // Active, Expired, Inactive

    // 🔗 Quan hệ
    public User? Seller { get; set; }

}
