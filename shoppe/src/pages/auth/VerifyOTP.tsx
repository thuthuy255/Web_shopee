import React, { useState, useRef } from "react";
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
import type { InputRef } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo_home.png";
import backgroundImg from "../../assets/img/background.jpg";
import { VerifyOtp } from "../../api/auth.api";
import { DEFAULT_TEXT_DARK } from "../../constants/Color";
import { showError, showSuccess } from "../../untils/ShowToast";

const { Title, Text } = Typography;

export default function VerifyOTP() {
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const inputsRef = useRef<(InputRef | null)[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    // Xử lý nhập số
    const handleChange = (value: string, index: number) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < otp.length - 1) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    // Xử lý phím Backspace
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    // Submit verify OTP
    const handleVerifyOtp = async () => {
        const code = otp.join("");
        if (code.length < 6) {
            message.error("Vui lòng nhập đủ 6 số OTP");
            return;
        }

        try {
            setLoading(true);
            const res: any = await VerifyOtp({ email, otp: code });
            if (res?.success) {
                showSuccess(res.message || "Xác thực thành công");
                navigate("/auth/reset-password", { state: { email } });
            } else {
                showError(res.message || "OTP không chính xác");
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
                        Xác minh OTP
                    </Title>
                    <Text
                        type="secondary"
                        style={{ display: "block", textAlign: "center", marginBottom: 24 }}
                    >
                        Nhập mã OTP gồm 6 chữ số đã gửi đến email của bạn
                    </Text>

                    {/* Form nhập OTP */}
                    <Form onFinish={handleVerifyOtp}>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                                marginBottom: 20,
                            }}
                        >
                            {otp.map((value, index) => (
                                <Input
                                    key={index}
                                    value={value}
                                    maxLength={1}
                                    ref={(el) => {
                                        inputsRef.current[index] = el;
                                    }}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    style={{
                                        width: 45,
                                        height: 50,
                                        textAlign: "center",
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        borderRadius: 8,
                                    }}
                                />
                            ))}
                        </div>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                            >
                                Xác nhận
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* Link quay lại */}
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        <Link to="/auth/sendOTP" style={{ color: DEFAULT_TEXT_DARK }}>
                            ← Quay lại nhập email
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
