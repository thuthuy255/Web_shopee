using ProductAPI.Core;
using ProductAPI.DTOs.Payment;
using ProductAPI.Models;
using static ProductAPI.Data.Enums.Enums;

namespace ProductAPI.IServices
{
    public interface IPaymentServices
    {
        //Task<IMethodResult<bool>> UpdatePaymentStatusAsync(Guid id, PaymentStatus status);
        //Task<IMethodResult<Payment>> CreatePaymentAsync(AddorUpdatePaymentRequest request);
        Task<(bool Success, string ResponseCode, string Message)> HandleVnPayReturnAsync(IQueryCollection query);
        Task<string> CreatePaymentUrlAsync(AddorUpdatePaymentRequest request);
    }
}
