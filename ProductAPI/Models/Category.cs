using System.ComponentModel.DataAnnotations.Schema;

namespace ProductAPI.Models
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public Guid? ParentCategoryId { get; set; }

        [ForeignKey(nameof(ParentCategoryId))]
        public Category? ParentCategory { get; set; }

        public ICollection<Category>? SubCategories { get; set; }

        public ICollection<Product>? Products { get; set; }
        public Guid? SellerId { get; set; }
        [ForeignKey(nameof(SellerId))]
        public User? Seller { get; set; }
    }
}
