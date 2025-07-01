namespace ProductAPI.DTOs.Common
{
    public class GridInfo
    {
        public PageInfo? PageInfo { get; set; }
        public Filter? Filter { get; set; } 
        public Sort? Sorts { get; set; }
        public string? KeyWord { get; set; }

    }
}
