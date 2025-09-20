using Microsoft.AspNetCore.Mvc;
using ProductAPI.IServices;
using System.Threading.Tasks;

namespace ProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticController : ControllerBase
    {
        private readonly IStatisticService _statisticService;

        public StatisticController(IStatisticService statisticService)
        {
            _statisticService = statisticService;
        }

        // GET: api/Statistic/getTotalProduct
        [HttpGet("getTotalProduct")]
        public async Task<IActionResult> GetTotalProduct()
        {
            var result = await _statisticService.GetTotalProductAsync();
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.TotalRecord
                });
            }
            return BadRequest(new { success = false, message = result.Message });
        }

        // GET: api/Statistic/getTotalOrder
        [HttpGet("getTotalOrder")]
        public async Task<IActionResult> GetTotalOrder()
        {
            var result = await _statisticService.GetTotalOrderAsync();
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.TotalRecord
                });
            }
            return BadRequest(new { success = false, message = result.Message });
        }

        // GET: api/Statistic/getTotalUser
        [HttpGet("getTotalUser")]
        public async Task<IActionResult> GetTotalUser()
        {
            var result = await _statisticService.GetTotalUserAsync();
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.TotalRecord
                });
            }
            return BadRequest(new { success = false, message = result.Message });
        }

        // GET: api/Statistic/getTotalRevenue
        [HttpGet("getTotalRevenue")]
        public async Task<IActionResult> GetTotalRevenue()
        {
            var result = await _statisticService.GetTotalRevenueAsync();
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.TotalRecord
                });
            }
            return BadRequest(new { success = false, message = result.Message });
        }

        // GET: api/Statistic/getProductPercentageByCategory
        [HttpGet("getProductPercentageByCategory")]
        public async Task<IActionResult> GetProductPercentageByCategory()
        {
            var result = await _statisticService.GetProductPercentageByCategoryAsync();
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data,
                    totalRecord = result.Data?.Count ?? 0
                });
            }
            return BadRequest(new { success = false, message = result.Message });
        }
    }
}
