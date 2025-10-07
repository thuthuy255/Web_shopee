import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Typography,
  Image,
  Space,
  Flex,
} from "antd";
import { GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo_home.png";
import backgroundImg from "../../assets/img/background.jpg";
import { LoginAPI } from "../../api/auth.api";
import { DEFAULT_TEXT, DEFAULT_TEXT_DARK } from "../../constants/Color";
import { showError, showSuccess } from "../../untils/ShowToast";
import { jwtDecode } from "jwt-decode";
import { ROLE } from "../../constants";
import { useDispatch } from "react-redux";
import { setAppState } from "../../features/slices/app.slice";
import { getUserCartItems } from "../../api/cartitem/cartitem.api";
import { getUserInfo } from "../../api/user.api";
import { setUserState } from "../../features/slices/user.slice";

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const disptach = useDispatch();

  const handleLogin = async (value: any) => {
    setLoading(true);
    try {
      const res: any = await LoginAPI(value);
      if (res?.success) {
        const token = res.data?.token;
        localStorage.setItem("access_token", token);

        const decoded: any = jwtDecode(token);
        const role =
          decoded.role_id ||
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        disptach(
          setAppState({
            role_id: role,
            token,
          })
        );

        // 👉 Gọi API lấy thông tin user ngay sau khi có token
        try {
          const userInfoRes: any = await getUserInfo(); // API bạn đã viết
          if (userInfoRes?.success) {
            disptach(setUserState(userInfoRes.data)); // set vào Redux hoặc state
          }
        } catch (userErr) {
          console.error("Lấy thông tin người dùng thất bại", userErr);
        }

        showSuccess("Đăng nhập thành công");

        // 👉 Điều hướng theo role
        switch (role) {
          case ROLE.ADMIN:
            navigate("/admin/dashboard");
            break;
          case ROLE.SELLER:
            navigate("/seller");
            break;
          default:
            navigate("/user");
            break;
        }
      }
    } catch (e: any) {
      showError(e?.error || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };



  return (
    <Row style={{ height: "100vh" }}>
      <Col
        xs={24}
        md={12}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400, paddingTop: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Image src={logo} alt="logo" preview={false} width={120} />
          </div>

          <Title level={4} style={{ textAlign: "center", marginBottom: 12 }}>
            Đăng nhập
          </Title>

          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email" }]}
            >
              <Input placeholder="Nhập email" size="large" />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>

            <Form.Item style={{ textAlign: "center" }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Tiếp tục
              </Button>
            </Form.Item>
          </Form>

          <Flex justify="space-between" style={{ textAlign: "center", marginTop: 16 }}>
            <span
              style={{
                fontStyle: "italic",
                textAlign: "center",
                color: DEFAULT_TEXT_DARK,
              }}
            >
              Bạn chưa có tài khoản?{" "}
              <Link to="/auth/register" style={{ fontWeight: "bold" }}>
                Đăng ký
              </Link>
            </span>

            <Link to="/auth/sendOTP" style={{
              fontStyle: "bold",
              textAlign: "center",
              color: DEFAULT_TEXT_DARK,
            }}>
              Quên mật khẩu
            </Link>
          </Flex>

          <div style={{ textAlign: "center", margin: "16px 0", color: "#999" }}>
            Hoặc đăng nhập bằng tài khoản
          </div>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              icon={<GoogleOutlined />}
              block
              size="large"
              style={{
                backgroundColor: DEFAULT_TEXT,
                color: "#fff",
                border: "none",
              }}
            >
              Đăng nhập với Google
            </Button>
            <Button
              icon={<FacebookFilled />}
              block
              size="large"
              style={{
                backgroundColor: "#3b5998",
                color: "#fff",
                border: "none",
              }}
            >
              Đăng nhập với Facebook
            </Button>
          </Space>
        </div>
      </Col>

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
};

export default Login;
