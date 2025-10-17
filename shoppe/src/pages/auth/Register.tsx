import React from 'react';
import { Row, Col, Form, Input, Button, Typography, Image, Space, Flex } from 'antd';
import { GoogleOutlined, FacebookFilled } from '@ant-design/icons';
import logo from '../../assets/img/logo_home.png';
import backgroundImg from '../../assets/img/background.jpg';
import { RegisterUser } from '../../api/auth.api';
import { showError, showSuccess } from '../../untils/ShowToast';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { DEFAULT_TEXT_DARK } from '../../constants/Color';

const { Title } = Typography;

const Register = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleRegister = async (values: any) => {
        try {
            const payload = {
                email: values.email,
                password: values.password,
                phone: values.phone,
            };
            const res: any = await RegisterUser(payload);
            if (res.success == true) {
                showSuccess('Đăng ký thành công');
                navigate('/auth/login');
            }
            else {
                showError(res.error)
            }

        } catch (message: any) {
            showError(message?.error);
        }
    };

    return (
        <Row style={{ height: '100vh' }}>
            <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Image src={logo} alt="logo" preview={false} width={70} />
                    </div>

                    <Title level={4} style={{ textAlign: 'center', marginBottom: 12 }}>
                        Đăng Ký
                    </Title>

                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleRegister}
                        initialValues={{ email: '', password: '', phone: '', username: '', fullName: '' }}
                    >
                        {/* <Form.Item
                            label="Tên đăng nhập"
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                        >
                            <Input size="large" placeholder="Tên đăng nhập" />
                        </Form.Item>

                        <Form.Item
                            label="Họ và tên"
                            name="fullName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                        >
                            <Input size="large" placeholder="Họ và tên" />
                        </Form.Item> */}

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input size="large" placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message: 'Số điện thoại phải gồm đúng 10 chữ số',
                                },
                            ]}
                        >
                            <Input size="large" placeholder="Số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu' },
                                // { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                                {
                                    pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                                    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm tối thiểu 1 chữ cái viết hoa, 1 chữ số và 1 ký tự đặc biệt',
                                }

                            ]}
                        >
                            <Input.Password size="large" placeholder="Mật khẩu" />
                        </Form.Item>


                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large">
                                Đăng ký
                            </Button>
                        </Form.Item>
                    </Form>
                    <Flex justify="center" style={{ textAlign: "center", marginTop: 16 }}>
                        <span
                            style={{
                                fontStyle: "italic",
                                textAlign: "center",
                                color: DEFAULT_TEXT_DARK,
                            }}
                        >
                            Bạn đã có tài khoản?{" "}
                            <Link to="/auth/login" style={{ fontWeight: "bold" }}>
                                Đăng nhập
                            </Link>
                        </span>
                    </Flex>
                    <div style={{ textAlign: 'center', margin: '16px 0', color: '#999' }}>
                        Hoặc đăng nhập bằng tài khoản
                    </div>

                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                            icon={<GoogleOutlined />}
                            block
                            size="large"
                            style={{ backgroundColor: '#DB4437', color: '#fff', border: 'none' }}
                        >
                            Đăng nhập với Google
                        </Button>
                        <Button
                            icon={<FacebookFilled />}
                            block
                            size="large"
                            style={{ backgroundColor: '#3b5998', color: '#fff', border: 'none' }}
                        >
                            Đăng nhập với Facebook
                        </Button>
                    </Space>
                </div>
            </Col>

            <Col xs={0} md={12}>
                <div
                    style={{
                        height: '100%',
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
                    }}
                ></div>
            </Col>
        </Row>
    );
};

export default Register;
