import React, { memo, useCallback, useEffect, useState } from "react";
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
  type UploadFile,
} from "antd";
import { getUserInfo, updateUser } from "../../api/user.api";
import { showError, showSuccess } from "../../untils/ShowToast";
import { useDispatch, useSelector } from "react-redux";
import { setUserState } from "../../features/slices/user.slice";
import type { RootState } from "../../features/store";


const { Title, Text } = Typography;

export const ProfileForm = () => {
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const role = useSelector((state: RootState) => state.user.role);
  const dispatch = useDispatch();
  const handleUpload = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj as File;
      setAvatarUrl(URL.createObjectURL(file)); // preview local
    } else {
      setAvatarUrl(null);
    }
  };

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();

      formData.append("Id", values.id);

      if (role === "Seller" && values.userName) {
        formData.append("UserName", values.userName);
      }
      if (values.email) formData.append("Email", values.email);
      if (values.fullName) formData.append("FullName", values.fullName);
      if (values.phone) formData.append("Phone", values.phone);


      if (fileList[0]?.originFileObj) {
        formData.append("Avatar", fileList[0].originFileObj as File);
      }

      const res: any = await updateUser(formData);

      if (res.success) {
        showSuccess("Cập nhật thành công");
        dispatch(setUserState(res.data));
        handleGetInfoUser();
      } else {
        showError(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      showError("Cập nhật thất bại");
    }
  };


  const handleGetInfoUser = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getUserInfo();
      if (res.success && res.data) {
        const userData = res.data;

        // set giá trị vào form
        form.setFieldsValue({
          id: userData.id, // lưu vào form hidden field
          username: userData.userName, // map từ BE -> FE
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
        });

        if (userData.avatar) {
          setAvatarUrl(userData.avatar);
        }
      }
    } catch (error) {
      showError("Không thể lấy thông tin người dùng");
    } finally {
      setLoading(false);
    }
  }, [form, setLoading, setAvatarUrl]); // dependencies

  useEffect(() => {
    handleGetInfoUser();
  }, []);

  return (
    <Card
      bordered={false}
      style={{
        border: "2px solid #d9d9d9",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Title level={4} style={{ marginBottom: 24 }}>
        Hồ Sơ Của Tôi
      </Title>
      <Text type="secondary">Quản lý thông tin hồ sơ để bảo mật tài khoản</Text>

      <Row gutter={48} style={{ marginTop: 32 }}>
        <Col span={16}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* hidden id field */}
            <Form.Item name="id" hidden>
              <Input type="hidden" />
            </Form.Item>

            {/* <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                {
                  pattern: /^[a-zA-Z0-9]+$/,
                  message: "Chỉ được nhập chữ, số, không dấu, không khoảng trắng",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập tên đăng nhập"
                onChange={(e) => {
                  const value = e.target.value;
                  // Loại bỏ khoảng trắng và ký tự có dấu
                  const normalized = value
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "")
                  e.target.value = normalized;
                }}
              />
            </Form.Item> */}
            {role === "Seller" && (
              <Form.Item
                name="userName"
                label="Tên cửa hàng"
                rules={[{ required: true, message: "Vui lòng nhập tên cửa hàng" }]}
              >
                <Input size="large" placeholder="Nhập tên cửa hàng" />
              </Form.Item>
            )}


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
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
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
              beforeUpload={() => false}
              // showUploadList={false}
              onChange={handleUpload}
              maxCount={1}
              fileList={fileList}
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

export default memo(ProfileForm);
