namespace ProductAPI.DTOs.Statistic
{
    public class OrderStatisticSummaryDto
    {
        public int TotalOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageRevenuePerOrder { get; set; }
    }
}
