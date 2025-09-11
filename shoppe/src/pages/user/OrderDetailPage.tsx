import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Spin,
    message,
    Divider,
    Button,
} from "antd";
import { getOrderDetail } from "../../api/order/order.api";
import { getUserAddresses } from "../../api/address/address.api";
import AddressManagement from "./AddressManagement";
import { formatCurrency } from "../../untils/FormatPrice";

const { Text, Title } = Typography;



const statusColor = (status: string) => {
    switch (status) {
        case "Pending":
            return "orange";
        case "Completed":
            return "green";
        case "Cancelled":
            return "red";
        default:
            return "blue";
    }
};

const OrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    useEffect(() => {
        if (orderId) fetchOrderDetail(orderId);
        fetchAddresses();
    }, [orderId]);

    const fetchOrderDetail = async (id: string) => {
        setLoading(true);
        try {
            const res = await getOrderDetail(id);
            console.log("🚀 ~ fetchOrderDetail ~ res:", res)
            setOrder(res);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải chi tiết đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res: any = await getUserAddresses();
            setAddresses(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải địa chỉ.");
        }
    };

    // Tìm địa chỉ theo addressId
    const orderAddress = order?.addressId
        ? addresses.find((a) => a.id === order.addressId)
        : null;

    if (loading || !order) {
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div
            style={{ padding: "24px 16px", maxWidth: "80%", margin: "0 auto" }}
        >
            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
                bodyStyle={{ padding: 24 }}
            >
                {/* Header */}
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={4}>
                            Mã đơn: <Text code>{order.id}</Text>
                        </Title>
                    </Col>
                    <Col>
                        <Tag
                            color={statusColor(order.status)}
                            style={{
                                fontWeight: 600,
                                fontSize: 14,
                                padding: "4px 12px",
                                borderRadius: 6,
                            }}
                        >
                            {order.status}
                        </Tag>
                    </Col>
                </Row>

                <Divider />

                {/* Địa chỉ giao hàng */}
                <Card
                    type="inner"
                    title="Địa chỉ giao hàng"
                    style={{ marginBottom: 16 }}
                >
                    {orderAddress ? (
                        <>
                            <Text strong>{orderAddress.fullName}</Text> -{" "}
                            <Text>{orderAddress.phoneNumber}</Text>
                            <div>
                                {orderAddress.detail}, {orderAddress.ward},{" "}
                                {orderAddress.district}, {orderAddress.city}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <Button
                                    type="link"
                                    onClick={() => setIsAddressModalOpen(true)}
                                >
                                    Thêm/Sửa địa chỉ
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text type="secondary">Chưa có địa chỉ giao hàng</Text>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => setIsAddressModalOpen(true)}
                            >
                                Thêm/Sửa địa chỉ
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Danh sách sản phẩm */}
                {order.orderItems?.map((item: any) => (
                    <Card
                        key={item.id}
                        hoverable
                        style={{ marginBottom: 16, borderRadius: 10 }}
                        bodyStyle={{ padding: 16 }}
                    >
                        <Row gutter={16} align="middle">
                            <Col span={6}>
                                <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    style={{
                                        width: "100%",
                                        height: 100,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                            </Col>
                            <Col span={12}>
                                <Title level={5}>{item.productName}</Title>
                                <Text type="secondary">Số lượng: {item.quantity}</Text>
                            </Col>
                            <Col span={6} style={{ textAlign: "right" }}>
                                <Title level={5} style={{ color: "#fa541c" }}>
                                    {formatCurrency(item.price)}
                                </Title>
                            </Col>
                        </Row>
                    </Card>
                ))}

                <Divider />

                {/* Tổng tiền và mã giảm giá */}
                <Row justify="space-between" align="middle">
                    <Col>
                        {order.promotionCode && (
                            <Tag color="cyan" style={{ fontWeight: 600 }}>
                                Mã giảm giá: {order.promotionCode}
                            </Tag>
                        )}
                    </Col>
                    <Col style={{ textAlign: "right" }}>
                        <Title level={3} style={{ color: "#1890ff" }}>
                            Tổng: {formatCurrency(order.totalAmount)}
                        </Title>
                        {order.paymentMethod && (
                            <Text type="secondary">Thanh toán: {order.paymentMethod}</Text>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Modal quản lý địa chỉ */}
            <AddressManagement
                visible={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSaved={fetchAddresses} // reload địa chỉ sau khi thêm/sửa
            />
        </div>
    );
};

export default OrderDetail;
