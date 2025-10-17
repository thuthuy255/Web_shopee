// pages/order/OrderList.tsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Tag, Spin, Empty, message } from "antd";
import type { IOrder } from "../../untils/types/TypeOderItem";
import { getUserOrders } from "../../api/order/order.api";
import { formatCurrency } from "../../untils/FormatPrice";

const { Text } = Typography;

// Hàm format tiền VNĐ


const OrderList = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res: any = await getUserOrders();
            if (res) {
                setOrders(res);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Fetch orders failed:", error);
            message.error("Không thể tải đơn hàng. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            {orders.length === 0 ? (
                <Empty description="Chưa có đơn hàng nào" />
            ) : (
                orders.map((order) => (
                    <Card
                        key={order.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        bodyStyle={{ padding: 16 }}
                    >
                        {/* Thông tin chung của đơn */}
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text strong>Mã đơn: {order.id}</Text>
                            </Col>
                            <Col>
                                <Tag
                                    color={
                                        order.status === "Pending"
                                            ? "orange"
                                            : order.status === "Completed"
                                                ? "green"
                                                : "red"
                                    }
                                >
                                    {order.status}
                                </Tag>
                            </Col>
                        </Row>

                        {/* Danh sách sản phẩm trong đơn */}
                        <div style={{ marginTop: 16 }}>
                            {order.orderItems.map((item) => (
                                <Row
                                    key={item.id}
                                    gutter={16}
                                    align="middle"
                                    style={{ marginBottom: 12 }}
                                >
                                    <Col span={4}>
                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            style={{
                                                width: "50%",
                                                borderRadius: 6,
                                                objectFit: "cover",
                                            }}
                                        />
                                    </Col>
                                    <Col span={14}>
                                        <Text>{item.productName}</Text>
                                        <div>SL: {item.quantity}</div>
                                    </Col>
                                    <Col span={6} style={{ textAlign: "right" }}>
                                        <Text strong>{formatCurrency(item.price)}</Text>
                                    </Col>
                                </Row>
                            ))}
                        </div>

                        {/* Tổng tiền */}
                        <div style={{ textAlign: "right", marginTop: 12 }}>
                            <Text strong>Tổng: {formatCurrency(order.totalAmount)}</Text>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

export default OrderList;
