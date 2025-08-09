using System.ComponentModel.DataAnnotations;

namespace ProductAPI.DTOs.Report
{
    public class ReportDto
    {
        public Guid? Id { get; set; }

        [Required, StringLength(20)]
        public string ReportedType { get; set; } = string.Empty;

        [Required]
        public Guid ReportedId { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;

        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Optional, mostly for admin
    }
}
