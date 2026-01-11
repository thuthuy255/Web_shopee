using System.ComponentModel.DataAnnotations;

public class PromotionDto
{
    public Guid? Id { get; set; }
    public Guid UserId { get; set; }

    [Required, StringLength(50)]
    public string Code { get; set; } = string.Empty;

    [StringLength(255)]
    public string? Description { get; set; }

    [Range(typeof(decimal), "1", "100", ErrorMessage = "DiscountPercent phải từ 1 đến 100")]
    public decimal DiscountPercent { get; set; }   // ✅ decimal

    public decimal? MinOrderValue { get; set; }     // ✅ nullable
    public int? QuantityLimit { get; set; }         // ✅ nullable

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string? Status { get; set; }
}
