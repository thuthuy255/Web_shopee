namespace ProductAPI.DTOs.Common
{
    public class Filter 
    {
        public string Field { get; set; } = string.Empty;
        public string KeyWord { get; set; }= string.Empty;
        public string Operator { get; set; } = "Equals";
    }
}
