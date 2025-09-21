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

        [HttpGet("getStatisticAdminAsync")]
        public async Task<IActionResult> GetStatisticAdminAsync()
        {
            var result = await _statisticService.GetStatisticAdminAsync();
            return Ok(result);
        }

        [HttpGet("getAnnualRevenueStatistics")]
        public async Task<IActionResult> GetAnnualRevenueStatistics(int year)
        {
            var result = await _statisticService.GetAnnualRevenueStatistics(year);
            return Ok(result);
        }

        [HttpGet("getProductPercentageByCategoryAsync")]
        public async Task<IActionResult> GetProductPercentageByCategoryAsync()
        {
            var result = await _statisticService.GetProductPercentageByCategoryAsync();
            return Ok(result);
        }
    }
}
