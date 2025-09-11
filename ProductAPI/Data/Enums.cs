using System.ComponentModel;
using System.Runtime.Serialization;

namespace ProductAPI.Data.Enums
{
    
        public partial class Enums
        {
            
            public enum PaymentStatus
            {
                [Description("Chờ xử lý (chưa xác nhận thanh toán)")]
                Pending = 0,

                [Description("Thanh toán thành công")]
                Paid = 1,

                [Description("Thanh toán thất bại hoặc bị hủy")]
                Failed = 2,

                [Description("Đã hoàn tiền cho khách hàng")]
                Refunded = 3
            }
        }
}
