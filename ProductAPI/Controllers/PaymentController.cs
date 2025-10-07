using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Payment;
using ProductAPI.IServices;
using System.Reflection.Metadata;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentServices _paymentServices;
        private readonly IConfiguration _config;
        public PaymentController(IPaymentServices paymentServices, IConfiguration config)
        {
            _paymentServices = paymentServices;
            _config = config;
        }
        
        [HttpPost("CreatePayment")]
        [Authorize(Roles = Constant.Constants.ROLE_USER)]
        public async Task<IActionResult> CreatePayment(AddorUpdatePaymentRequest request)
        {
            var url = await _paymentServices.CreatePaymentUrlAsync(request);
            return Ok(new { PaymentUrl = url });
        }
        [HttpGet("VnpayReturn")]
        public async Task<IActionResult> VnPayReturn()
        {
            var (success, code, message) = await _paymentServices.HandleVnPayReturnAsync(Request.Query);

            // URL FE bạn muốn redirect về
            var feUrl = "http://localhost:3000/user/payment/result";

            return Redirect($"{feUrl}?status={code}&message={Uri.EscapeDataString(message)}");
        }


    }
}
