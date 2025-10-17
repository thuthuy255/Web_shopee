import React, { useState } from "react";
import {
    Row,
    Col,
    Form,
    Input,
    Button,
    Typography,
    Image,
    message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo_home.png";
import backgroundImg from "../../assets/img/background.jpg";
import { SendOtp } from "../../api/auth.api"; // gọi API quên mật khẩu
import { DEFAULT_TEXT_DARK } from "../../constants/Color";
import { showError, showSuccess } from "../../untils/ShowToast";

const { Title, Text } = Typography;

export default function SendOTP() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (values: any) => {
        try {
            setLoading(true);
            const res: any = await SendOtp({ email: values.email });
            if (res?.success) {
                showSuccess(res.message || "OTP đã được gửi qua email");
                navigate("/auth/verifyOTP", { state: { email: values.email } });
            } else {
                showError(res.message || "Không gửi được OTP");
            }
        } catch (err) {
            message.error("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row style={{ height: "100vh" }}>
            {/* Cột form */}
            <Col
                xs={24}
                md={12}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 24px",
                }}
            >
                <div style={{ width: "100%", maxWidth: 400 }}>
                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <Image src={logo} alt="logo" preview={false} width={120} />
                    </div>

                    {/* Title */}
                    <Title level={3} style={{ textAlign: "center", marginBottom: 8 }}>
                        Quên mật khẩu
                    </Title>
                    <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
                        Nhập email của bạn để nhận mã OTP xác minh
                    </Text>

                    {/* Form */}
                    <Form layout="vertical" onFinish={handleSendOtp}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input placeholder="Nhập email của bạn" size="large" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                            >
                                Gửi OTP
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* Link quay lại */}
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        <Link to="/auth/login" style={{ color: DEFAULT_TEXT_DARK }}>
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </Col>

            {/* Cột background */}
            <Col xs={0} md={12}>
                <div
                    style={{
                        height: "100%",
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%)",
                    }}
                />
            </Col>
        </Row>
    );
}
