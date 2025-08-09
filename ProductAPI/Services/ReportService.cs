using Microsoft.EntityFrameworkCore;
using ProductAPI.Core;
using ProductAPI.DTOs.Report;
using ProductAPI.IRepository;
using ProductAPI.IServices;
using ProductAPI.Models;
using ProductAPI.Constant;

namespace ProductAPI.Services
{
    public class ReportService : BaseService<Report>, IReportService
    {
        private readonly IRepository<Report> _reportRepo;
        private readonly IRepository<User> _userRepo;
        private readonly IAuthServices _authService;

        public ReportService(
            IRepository<Report> reportRepo,
            IRepository<User> userRepo,
            IAuthServices authService
        ) : base(reportRepo)
        {
            _reportRepo = reportRepo;
            _userRepo = userRepo;
            _authService = authService;
        }

        public async Task<MethodResult<Report>> CreateAsync(Guid reporterId, ReportDto dto)
        {
            var report = new Report
            {
                Id = Guid.NewGuid(),
                ReporterId = reporterId,
                ReportedType = dto.ReportedType,
                ReportedId = dto.ReportedId,
                Reason = dto.Reason,
                Status = "Pending"
            };

            await _reportRepo.AddAsync(report);

            if (dto.ReportedType == "User")
            {
                var count = await _reportRepo.Table
                    .CountAsync(r => r.ReportedType == "User" && r.ReportedId == dto.ReportedId);

                if (count >= Constants.REPORT_THRESHOLD)
                {
                    var user = await _userRepo.GetByIdAsync(dto.ReportedId);
                    if (user != null && !user.IsLocked)
                    {
                        await _authService.ToggleUserLockAsync(user.Id); 
                    }
                }
            }

            return MethodResult<Report>.ResultWithData(report, "Đã gửi báo cáo.");
        }

        public async Task<MethodResult<List<Report>>> GetAllAsync()
        {
            var list = await _reportRepo.TableNoTracking
                .Include(r => r.Reporter)
                .OrderByDescending(r => r.Created)
                .ToListAsync();

            return MethodResult<List<Report>>.ResultWithData(list, "Lấy danh sách báo cáo thành công.");
        }

        public async Task<MethodResult<Report>> GetByIdAsync(Guid id)
        {
            var report = await _reportRepo.TableNoTracking
                .Include(r => r.Reporter)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
                return MethodResult<Report>.ResultWithError("Không tìm thấy báo cáo.");

            return MethodResult<Report>.ResultWithData(report, "Lấy chi tiết báo cáo thành công.");
        }

        public async Task<MethodResult<Report>> UpdateStatusAsync(Guid id, string status)
        {
            var report = await _reportRepo.GetByIdAsync(id);
            if (report == null)
                return MethodResult<Report>.ResultWithError("Không tìm thấy báo cáo.");

            report.Status = status;
            await _reportRepo.UpdateAsync(report);

            return MethodResult<Report>.ResultWithData(report, $"Đã cập nhật trạng thái: {status}.");
        }
    }
}
