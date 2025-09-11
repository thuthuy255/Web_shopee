using System;
using static ProductAPI.Data.Enums.Enums;

namespace ProductAPI.DTOs.Payment
{
    public class AddorUpdatePaymentRequest
    {
        public Guid OrderId { get; set; }     
        public decimal Amount { get; set; }
        public string? TxnRef { get; set; }
        public PaymentStatus Status { get; set; }
    }
}
