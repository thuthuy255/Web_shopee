import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Avatar,
  Typography,
  Row,
  Col,
  Upload,
  message,
  Card,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProfileForm: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/150?img=5");

  const handleUpload = (info: any) => {
    if (info.file.status === "done" || info.file.originFileObj) {
      const newAvatar = URL.createObjectURL(info.file.originFileObj);
      setAvatarUrl(newAvatar);
      message.success(`Ảnh đã được cập nhật`);
    } else if (info.file.status === "error") {
      message.error(`Tải ảnh thất bại`);
    }
  };

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: "80%",
        margin: "0 auto",
        padding: 32,
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
        backgroundColor: "#fff",
      }}
    >
      <Title level={4} style={{ marginBottom: 24 }}>
        Hồ Sơ Của Tôi
      </Title>
      <Text type="secondary">Quản lý thông tin hồ sơ để bảo mật tài khoản</Text>

      <Row gutter={48} style={{ marginTop: 32 }}>
        <Col span={16}>
          <Form layout="vertical">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
              ]}
            >
              <Input size="large" placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input size="large" placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input size="large" placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input size="large" placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item style={{ textAlign: "left", marginTop: 24 }}>
              <Button type="primary" htmlType="submit" size="large">
                Lưu
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col span={8} style={{ textAlign: "center" }}>
          <Avatar
            size={120}
            src={avatarUrl}
            alt="avatar"
            style={{
              border: "2px solid #d9d9d9",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
          <div style={{ marginTop: 12 }}>
            <Upload
              showUploadList={false}
              accept="image/*"
              onChange={handleUpload}
            >
              <Button>Chọn Ảnh</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
              Dung lượng file tối đa 1 MB
              <br />
              Định dạng: .JPEG, .PNG
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ProfileForm;
