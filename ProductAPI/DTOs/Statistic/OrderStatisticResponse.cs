namespace ProductAPI.DTOs.Statistic
{
    public class OrderStatisticResponse
    {
        public OrderStatisticSummaryDto Summary { get; set; } = new();
        public List<OrderStatisticItemDto> Orders { get; set; } = new();
    }
}
