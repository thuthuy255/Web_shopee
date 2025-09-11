using ProductAPI.DTOs.Common;

namespace ProductAPI.DTOs.Payment
{
    public class SearchPaymentRequest:GridInfo
    {
        public Guid UserId { get; set; }
    }
}
