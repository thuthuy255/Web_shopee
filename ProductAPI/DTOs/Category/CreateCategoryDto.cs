
namespace ProductAPI.DTOs.Category
{
    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public IFormFile? ImageFile { get; set; }  // Ảnh đại diện

        public Guid? ParentCategoryId { get; set; }
    }
}
