using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Order;
using ProductAPI.IServices;

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

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
        {
            var userId = _userPrincipal.GetUserId();
            var result = await _orderService.CreateOrderAsync(userId.Value, dto);
            return Ok(result);
        }

        [HttpGet("my-orders")]
        public async Task<IActionResult> MyOrders()
        {
            var userId = _userPrincipal.GetUserId();
            var orders = await _orderService.GetUserOrdersAsync(userId.Value);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(Guid id)
        {
            var userId = _userPrincipal.GetUserId();
            var order = await _orderService.GetOrderDetailAsync(id, userId.Value);
            return order != null ? Ok(order) : NotFound();
        }
    }

}
