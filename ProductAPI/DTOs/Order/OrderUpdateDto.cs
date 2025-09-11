using System;

namespace ProductAPI.DTOs.Order
{
    public class OrderUpdateDto
    {
        public Guid? AddressId { get; set; }      
        public string? PromotionCode { get; set; } 
    }
}
