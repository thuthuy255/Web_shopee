using ProductAPI.Models;
using System.ComponentModel.DataAnnotations;



public class Promotion : BaseEntity
{
    public Guid UserId { get; set; }

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
    public string Status { get; set; } = PromotionStatus.Active.ToString();

    public User? User { get; set; }
}
public enum PromotionStatus
{
    Active,     // Hoạt động
    Expired,    // Hết hạn
    Inactive    // Không hoạt động
}