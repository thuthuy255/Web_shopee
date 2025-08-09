using System.Text.Json.Serialization;

namespace ProductAPI.DTOs.Banner
{
    public class BannerDTO
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? ImageUrl { get; set; }
        public string? LinkTo { get; set; }
        public bool IsActive { get; set; }
        public string? Type { get; set; }
    }
}
