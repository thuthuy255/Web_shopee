import React from 'react';
import { Row, Col, Image, Space, Divider, Flex, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
const { Text } = Typography;



const Footer = () => {
    return (
        <div style={{ backgroundColor: '#f5f5f5', padding: '40px 80px' }}>
            <Row gutter={32}>
                {/* Cột 1 */}
                <Col xs={24} sm={12} md={6}>
                    <Title level={5}>CHĂM SÓC KHÁCH HÀNG</Title>
                    <Space direction="vertical">
                        <Text>Trung tâm trợ giúp</Text>
                        <Text>Hướng Dẫn Mua Hàng</Text>
                        <Text>Hướng Dẫn Bán Hàng</Text>
                        <Text>Thanh Toán</Text>
                        <Text>Vận Chuyển</Text>
                    </Space>
                </Col>

                {/* Cột 2 */}
                <Col xs={24} sm={12} md={6}>
                    <Title level={5}>THÔNG TIN</Title>
                    <Space direction="vertical">
                        <Text>Giới Thiệu </Text>
                        <Text>Tuyển Dụng</Text>
                        <Text>Điều Khoản</Text>
                        <Text>Chính Sách Bảo Mật</Text>
                        <Text>Kênh Người Bán</Text>
                        <Text>Flash Sales</Text>
                        <Text>Liên Hệ Với Truyền Thông</Text>
                    </Space>
                </Col>

                {/* Cột 3 */}
                <Col xs={24} sm={12} md={6}>
                    <Title level={5}>THANH TOÁN</Title>
                    <Space wrap>
                        <Image
                            className=""
                            src="https://down-vn.img.susercontent.com/file/d4bbea4570b93bfd5fc652ca82a262a8"
                            alt=""
                        />
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/a0a9062ebe19b45c1ae0506f16af5c16" alt="" />
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/38fd98e55806c3b2e4535c4e4a6c4c08" alt="" />
                    </Space>

                    <Divider style={{ margin: '16px 0' }} />

                    <Title level={5}>ĐƠN VỊ VẬN CHUYỂN</Title>
                    <Space style={{ marginBottom: '10px', gap: '10px' }} >
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/vn-50009109-159200e3e365de418aae52b840f24185" />
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/d10b0ec09f0322f9201a4f3daf378ed2" />
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/77bf96a871418fbc21cc63dd39fb5f15" />
                    </Space>
                    <Space >
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/59270fb2f3fbb7cbc92fca3877edde3f" />
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/957f4eec32b963115f952835c779cd2c" />
                        <Image width={60} src="https://down-vn.img.susercontent.com/file/0d349e22ca8d4337d11c9b134cf9fe63" />
                    </Space>
                </Col>

                {/* Cột 4 */}
                <Col xs={24} sm={12} md={6}>
                    <Title level={5}>TẢI ỨNG DỤNG </Title>
                    <Flex gap={12}>
                        <div>
                            <Image
                                width={80}
                                src="https://down-vn.img.susercontent.com/file/a5e589e8e118e937dc660f224b9a1472"
                            />
                        </div>
                        <div >
                            <Image
                                width={110}
                                src="https://down-vn.img.susercontent.com/file/ad01628e90ddf248076685f73497c163"
                            />
                            <div style={{ margin: '8px' }}>
                                <Image
                                    width={110}
                                    src="https://down-vn.img.susercontent.com/file/ae7dced05f7243d0f3171f786e123def"
                                />
                            </div>
                            <Image
                                width={110}
                                src="https://down-vn.img.susercontent.com/file/35352374f39bdd03b25e7b83542b2cb0"
                            />
                        </div>
                    </Flex>
                </Col>
            </Row>
        </div>
    );
};

export default Footer;
