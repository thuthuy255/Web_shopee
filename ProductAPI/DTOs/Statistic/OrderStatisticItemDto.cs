namespace ProductAPI.DTOs.Statistic
{
    public class OrderStatisticItemDto
    {
        public string OrderCode { get; set; } = "";
        public DateTime CreatedDate { get; set; }
        public string Status { get; set; } = "";
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = "";
        public string UserName { get; set; }
    }
}
