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
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo_home.png";
import backgroundImg from "../../assets/img/background.jpg";
import { ResetPassword } from "../../api/auth.api";
import { DEFAULT_TEXT_DARK } from "../../constants/Color";
import { showError, showSuccess } from "../../untils/ShowToast";

const { Title, Text } = Typography;

export default function ResetPasswordForm() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const onFinish = async (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            const res: any = await ResetPassword({
                email,
                newPassword: values.newPassword,
            });
            if (res?.success) {
                showSuccess(res.message || "Đặt lại mật khẩu thành công");
                navigate("/auth/login");
            } else {
                showError(res.message || "Đặt lại mật khẩu thất bại");
            }
        } catch (err) {
            message.error("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row style={{ height: "100vh" }}>
            {/* Form */}
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
                        Đặt lại mật khẩu
                    </Title>
                    <Text
                        type="secondary"
                        style={{ display: "block", textAlign: "center", marginBottom: 24 }}
                    >
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </Text>

                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
                        >
                            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
                        >
                            <Input.Password size="large" placeholder="Xác nhận mật khẩu" />
                        </Form.Item>

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

                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        <Link to="/auth/login" style={{ color: DEFAULT_TEXT_DARK }}>
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </Col>

            {/* Background */}
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
