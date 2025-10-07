using Microsoft.AspNetCore.Authorization;
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
        private readonly IUserPrincipalService _userPrincipalService;

        public StatisticController(IStatisticService statisticService, IUserPrincipalService userPrincipalService)
        {
            _statisticService = statisticService;
            _userPrincipalService = userPrincipalService;

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
        [HttpGet("getAnnualRevenueOfSeller")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> GetAnnualRevenueOfSeller(int year)
        {
            var sellerId = _userPrincipalService.GetUserId();

            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập");

            var result = await _statisticService.GetAnnualRevenueOfSeller(sellerId.Value, year);
            return Ok(result);
        }
        [HttpGet("getProductPercentageByCategoryOfSeller")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> GetProductPercentageByCategoryOfSeller()
        {
            var sellerId = _userPrincipalService.GetUserId();

            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập");

            var result = await _statisticService.GetProductPercentageByCategoryOfSeller(sellerId.Value);
            return Ok(result);
        }
        [HttpGet("getStatisticSellerAsync")]
        public async Task<IActionResult> getStatisticSellerAsync()
        {
            var sellerId = _userPrincipalService.GetUserId();

            if (!sellerId.HasValue)
                return Unauthorized("Bạn chưa đăng nhập");
            var result = await _statisticService.GetStatisticSellerAsync(sellerId.Value);
            return Ok(result);
        }
        [HttpGet("orders")]
        public async Task<IActionResult> GetOrderStatistics([FromQuery] DateTime? fromDate,[FromQuery] DateTime? toDate)
        {
            var sellerId = _userPrincipalService.GetUserId(); 

            var result = await _statisticService.GetOrderStatisticAsync(sellerId.Value, fromDate, toDate);
            return Ok(result);

        }
        //[HttpGet("orders/export")]
        //public async Task<IActionResult> ExportOrderStatistics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        //{
        //    var sellerId = _userPrincipalService.GetUserId();
        //    if (!sellerId.HasValue) return Unauthorized();

        //    var excelData = await _statisticService.ExportSellerOrderStatisticToExcelAsync(sellerId.Value, fromDate, toDate);
        //    var fileName = $"OrderStatistic_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
        //    return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        //}

    }
}
