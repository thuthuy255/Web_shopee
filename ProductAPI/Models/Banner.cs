using ProductAPI.Models;

public class Banner : BaseEntity
{
    public string Title { get; set; }
    public string ImageUrl { get; set; }
    public string? Type { get; set; }
    public string? LinkTo { get; set; }
    public bool IsActive { get; set; }
}