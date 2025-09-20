import { useEffect, useState } from "react";
import { Spin, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getVnPayReturn } from "../../api/order/order.api";

function PaymentResultPage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<null | boolean>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setLoading(true);
                const res = await getVnPayReturn();
                setStatus(res.data.Status);
            } catch (err) {
                console.error(err);
                setStatus(false);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin size="large" />
                <p>Đang kiểm tra trạng thái thanh toán...</p>
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center", padding: 50 }}>
            {status ? (
                <>
                    <h2 style={{ color: "#0f9d58" }}>🎉 Thanh toán thành công!</h2>
                    <p>Cảm ơn bạn đã mua hàng.</p>
                    <Button type="primary" onClick={() => navigate("/user")}>
                        Về trang chủ
                    </Button>
                </>
            ) : (
                <>
                    <h2 style={{ color: "#d0011b" }}>❌ Thanh toán thất bại</h2>
                    <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                    <Button type="primary" onClick={() => navigate("/cart")}>
                        Quay lại giỏ hàng
                    </Button>
                </>
            )}
        </div>
    );
}

export default PaymentResultPage;
