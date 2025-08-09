using System.Text.Json.Serialization;

namespace ProductAPI.DTOs.Banner
{
    public class CreateBannerDTO
    {
        public string? Title { get; set; }
        [JsonIgnore]
        public IFormFile? ImageFile { get; set; }
        public string? LinkTo { get; set; }
        public bool IsActive { get; set; }
        public string? Type { get; set; }
    }
}
