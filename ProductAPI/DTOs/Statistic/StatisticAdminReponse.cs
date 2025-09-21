namespace ProductAPI.DTOs.Statistic
{
    public class StatisticAdminReponse
    {
        public int totalProducts { get; set; }
        public int totalCategory { get; set; }
        public int totalVoucher { get; set; }
        public int totalQuantitySeller { get; set; }
        public decimal totalRevenue { get; set; }
    }
}
