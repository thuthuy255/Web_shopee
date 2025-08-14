import React, { useEffect, useState } from 'react';
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
} from 'antd';
import { getUserInfo, updateUser } from '../../api/user.api';
import { showError, showSuccess } from '../../untils/ShowToast';

const { Title, Text } = Typography;

const ProfileForm = () => {
    const [form] = Form.useForm();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const handleUpload = (info: any) => {
        console.log("🚀 ~ handleUpload ~ info:", info)
        if (info.file.name || info.file.originFileObj) {
            const file = info.file;
            setAvatarFile(file);
            const newAvatar = URL.createObjectURL(file);
            setAvatarUrl(newAvatar);
            showSuccess(`Ảnh đã được cập nhật`);
        } else if (info.file === 'error') {
            message.error(`Tải ảnh thất bại`);
        }
    };

    const onFinish = async (values: any) => {
        try {
            const formData = new FormData();
            formData.append('Id', values.id); // BE đang dùng Guid => để đúng key & chữ hoa nếu cần
            formData.append('Username', values.username);
            formData.append('FullName', values.fullName);
            formData.append('Email', values.email);
            formData.append('Phone', values.phone);

            if (avatarFile) {
                formData.append('Avatar', avatarFile);
            }

            const res: any = await updateUser(formData);
            if (res.success) {
                showSuccess('Cập nhật thành công');
                handleGetInfoUser(); // refresh lại dữ liệu
            } else {
                showError(res.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            console.error("🚀 ~ onFinish ~ err:", err);
            showError('Cập nhật thất bại');
        }
    };

    const handleGetInfoUser = async () => {
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
        }
        catch (error) {
            showError("Không thể lấy thông tin người dùng");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetInfoUser();
    }, []);

    return (
        <Card
            bordered={false}
            style={{
                maxWidth: '80%',
                margin: '0 auto',
                padding: 32,
                borderRadius: 16,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                backgroundColor: '#fff',
            }}
        >
            <Title level={4} style={{ marginBottom: 24 }}>Hồ Sơ Của Tôi</Title>
            <Text type="secondary">Quản lý thông tin hồ sơ để bảo mật tài khoản</Text>

            <Row gutter={48} style={{ marginTop: 32 }}>
                <Col span={16}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        {/* hidden id field */}
                        <Form.Item name="id" hidden>
                            <Input type="hidden" />
                        </Form.Item>

                        <Form.Item
                            name="username"
                            label="Tên đăng nhập"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                        >
                            <Input size="large" placeholder="Nhập tên đăng nhập" />
                        </Form.Item>

                        <Form.Item
                            name="fullName"
                            label="Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input size="large" placeholder="Nhập họ tên" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                        >
                            <Input size="large" placeholder="Nhập email" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                        >
                            <Input size="large" placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'left', marginTop: 24 }}>
                            <Button type="primary" htmlType="submit" size="large" loading={loading}>
                                Lưu
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>

                <Col span={8} style={{ textAlign: 'center' }}>
                    <Avatar
                        size={120}
                        src={avatarUrl}
                        alt="avatar"
                        style={{
                            border: '2px solid #d9d9d9',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
                        <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                            Dung lượng file tối đa 1 MB<br />
                            Định dạng: .JPEG, .PNG
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default ProfileForm;
