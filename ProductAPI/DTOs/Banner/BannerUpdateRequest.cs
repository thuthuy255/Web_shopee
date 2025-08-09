namespace ProductAPI.DTOs.Banner
{
    public class BannerUpdateRequest
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public IFormFile? ImageFile { get; set; }
        public string? LinkTo { get; set; }
        public bool IsActive { get; set; }
        public string? Type { get; set; }
    }
}
