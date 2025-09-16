using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Order;
using ProductAPI.IServices;
using ProductAPI.Services;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IUserPrincipalService _userPrincipal;

        public OrderController(IOrderService orderService, IUserPrincipalService userPrincipal)
        {
            _orderService = orderService;
            _userPrincipal = userPrincipal;
        }

        // Tạo order tạm thời
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _orderService.CreateOrderAsync(userId.Value, dto);
            return Ok(result);
        }

        [HttpPost("{orderId}/update-info")]
        public async Task<IActionResult> UpdateOrderInfo(Guid orderId, [FromBody] OrderUpdateDto dto)
        {
            var userId = _userPrincipal.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            // Truyền dto trực tiếp thay vì tách từng trường
            var result = await _orderService.UpdateOrderInfoAsync(orderId, userId.Value, dto);

            return result.Success ? Ok(result.Data) : BadRequest(result.Message);
        }


        // Lấy danh sách order của user
        [HttpGet("my-orders")]
        public async Task<IActionResult> MyOrders()
        {
            var userId = _userPrincipal.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            var orders = await _orderService.GetUserOrdersAsync(userId.Value);
            return Ok(orders);
        }

        // Lấy chi tiết order
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(Guid id)
        {
            var userId = _userPrincipal.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            var order = await _orderService.GetOrderDetailAsync(id, userId.Value);
            return order != null ? Ok(order) : NotFound();
        }
    }
}
