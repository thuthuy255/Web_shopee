using ProductAPI.Core;
using ProductAPI.DTOs.Report;
using ProductAPI.Models;

namespace ProductAPI.IServices
{
    public interface IReportService
    {
        Task<MethodResult<Report>> CreateAsync(Guid reporterId, ReportDto dto);
        Task<MethodResult<List<Report>>> GetAllAsync();
        Task<MethodResult<Report>> GetByIdAsync(Guid id);
        Task<MethodResult<Report>> UpdateStatusAsync(Guid id, string status);
    }
}
