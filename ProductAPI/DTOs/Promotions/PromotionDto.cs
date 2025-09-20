using System.ComponentModel.DataAnnotations;

public class PromotionDto
{
    public Guid? Id { get; set; }
    public Guid UserId { get; set; }

    public string Code { get; set; }

    public string? Description { get; set; }

    [Range(1, 100, ErrorMessage = "DiscountPercent phải từ 1 đến 100")]
    public int DiscountPercent { get; set; }

    public decimal MinOrderValue { get; set; }
    public int QuantityLimit { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string? Status { get; set; }
}
