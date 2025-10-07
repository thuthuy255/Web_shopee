namespace ProductAPI.DTOs.Statistic
{
    public class StatisticSellerResponse
    {
        public int TotalProducts { get; set; }
        public int TotalCategories { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
    }

}
