import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const status = params.get("status"); // 00 = thành công
    const txnRef = params.get("txnRef");

    const isSuccess = status === "00";

    useEffect(() => {
        if (!status) {
            navigate("/");
        }
        if (isSuccess) {
            // Sau 3 giây tự động chuyển trang
            const timer = setTimeout(() => {
                navigate("/user/orderstatus");
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            // Nếu không thành công thì quay về giỏ hàng
            navigate("/user/cart");
        }
    }, [status, isSuccess, navigate]);

    if (!isSuccess) return null;

    return (
        <div style={{ padding: "40px 20px" }}>
            <div
                style={{
                    maxWidth: 600,
                    margin: "0 auto",
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 16,
                    padding: "40px 30px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    textAlign: "center",
                    animation: "fadeIn 0.6s ease-in-out",
                }}
            >
                <CheckCircleOutlined style={{ fontSize: 72, color: "#52c41a" }} />
                <h2 style={{ margin: "20px 0 10px", fontSize: 24, fontWeight: 600 }}>
                    Thanh toán thành công!
                </h2>
                <p style={{ fontSize: 16, color: "#333" }}>
                    Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi 🎉
                </p>
                {txnRef && (
                    <p style={{ marginTop: 12, fontWeight: "bold" }}>
                        Mã giao dịch: <span style={{ color: "#000" }}>{txnRef}</span>
                    </p>
                )}
                <p style={{ marginTop: 20, color: "#888" }}>
                    Bạn sẽ được chuyển đến trang trạng thái đơn hàng trong giây lát...
                </p>
                <Button
                    type="primary"
                    onClick={() => navigate("/user/orderstatus")}
                    style={{ marginTop: 20 }}
                >
                    Xem trạng thái đơn hàng ngay
                </Button>
            </div>
        </div>
    );
}

export default PaymentResult;
