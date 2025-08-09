namespace ProductAPI.DTOs.Review
{
    public class ReviewDto
    {
        public Guid? Id { get; set; } // null nếu là tạo mới
        public Guid ProductId { get; set; }
        public int Rating { get; set; } // 1–5
        public string Comment { get; set; } = string.Empty;
    }

}
