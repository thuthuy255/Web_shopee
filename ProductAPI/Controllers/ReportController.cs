using Microsoft.AspNetCore.Mvc;
using ProductAPI.DTOs.Report;
using ProductAPI.IServices;
using ProductAPI.Models;
using ProductAPI.Constant; // nhớ import namespace chứa Constants

namespace ProductAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IUserPrincipalService _userService;

        public ReportController(IReportService reportService, IUserPrincipalService userService)
        {
            _reportService = reportService;
            _userService = userService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReportDto dto)
        {
            var userId = _userService.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("Không xác định được người dùng.");

            var result = await _reportService.CreateAsync(userId.Value, dto);
            return Ok(result);
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAll()
        {
            var role = _userService.GetRoleUser();
            if (role != Constants.ROLE_ADMIN)
                return Forbid();

            var result = await _reportService.GetAllAsync();
            return Ok(result);
        }

        [HttpPut("admin/{reportId}")]
        public async Task<IActionResult> UpdateStatus(Guid reportId, [FromBody] ReportDto dto)
        {
            var role = _userService.GetRoleUser();
            if (role != Constants.ROLE_ADMIN)
                return Forbid();

            var result = await _reportService.UpdateStatusAsync(reportId, dto.Status);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _reportService.GetByIdAsync(id);
            return Ok(result);
        }
    }
}
