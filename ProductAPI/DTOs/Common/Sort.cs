namespace ProductAPI.DTOs.Common
{
    public class Sort
    {
        public string Field { get; set; } = string.Empty;
        public string Direction { get; set; } = "ASC";   // cách sắp xếp tăng hoặc giảm dần
    }
}
