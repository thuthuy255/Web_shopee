using System.ComponentModel;

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

        public enum VnPayResponseCode
        {
            Code00 = 00, // Giao dịch thành công
            Code01 = 01, // Ngân hàng từ chối giao dịch
            Code02 = 02, // Lỗi từ phía ngân hàng
            Code03 = 03, // Lỗi không xác định
            Code04 = 04, // Người dùng hủy giao dịch
            Code05 = 05, // Giao dịch bị từ chối
            Code06 = 06, // Giao dịch hết hạn
            Code07 = 07, // Giao dịch bị nghi ngờ gian lận
            Code09 = 09, // Thẻ/Tài khoản chưa đăng ký InternetBanking
            Code10 = 10, // Xác thực không thành công
            Code11 = 11, // Hết hạn xác thực OTP
            Code12 = 12, // Sai thông tin thẻ
            Code13 = 13, // Thẻ không đủ hạn mức
            Code24 = 24, // Khách hàng hủy giao dịch (client cancel)
            Code51 = 51, // Tài khoản không đủ số dư
            Code65 = 65, // Vượt quá hạn mức giao dịch
            Code75 = 75, // Ngân hàng tạm thời không xử lý được
            Code79 = 79, // Ngân hàng từ chối xử lý
            Code97 = 97, // Checksum sai
            Code99 = 99  // Lỗi khác (không xác định)
        }

        public static string GetVnPayMessage(string code)
        {
            return code switch
            {
                "00" => "Thanh toán thành công",
                "01" => "Ngân hàng từ chối giao dịch",
                "02" => "Lỗi từ phía ngân hàng",
                "03" => "Lỗi không xác định",
                "04" => "Người dùng hủy giao dịch",
                "05" => "Giao dịch bị từ chối",
                "06" => "Giao dịch hết hạn",
                "07" => "Giao dịch bị nghi ngờ gian lận",
                "09" => "Thẻ/Tài khoản chưa đăng ký InternetBanking",
                "10" => "Xác thực không thành công",
                "11" => "Hết hạn xác thực OTP",
                "12" => "Sai thông tin thẻ",
                "13" => "Thẻ không đủ hạn mức",
                "24" => "Khách hàng hủy giao dịch",
                "51" => "Tài khoản không đủ số dư",
                "65" => "Vượt quá hạn mức giao dịch",
                "75" => "Ngân hàng tạm thời không xử lý được",
                "79" => "Ngân hàng từ chối xử lý",
                "97" => "Chữ ký không hợp lệ",
                "99" => "Lỗi khác",
                _ => "Không rõ trạng thái"
            };
        }
    }
}
