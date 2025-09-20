// components/orders/MyPaidOrders.tsx
import React, { useEffect, useState } from "react";
import { Card, List, Steps, Button, message, Spin, Modal, Input, Rate } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Step } = Steps;
const { TextArea } = Input;

interface OrderItemDto {
    Id: string;
    ProductId: string;
    ProductName: string;
    ProductImage?: string;
    Quantity: number;
    Price: number;
}

interface OrderDto {
    Id: string;
    UserId: string;
    UserName: string;
    AddressId?: string;
    AddressDetail?: string;
    PaymentStatus: number;
    TotalAmount: number;
    Created: string;
    OrderItems: OrderItemDto[];
    PaymentDate?: string;
    ShippedDate?: string;
    ReceivedDate?: string;
    CompletedDate?: string;
}

const MyPaidOrders = () => {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal đánh giá
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/Order/my-paid-orders");
            setOrders(res.data);
        } catch (err: any) {
            message.error(err.response?.data || "Lấy đơn hàng thất bại");
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStep = (order: OrderDto) => {
        if (order.CompletedDate) return 4;
        if (order.ReceivedDate) return 3;
        if (order.ShippedDate) return 2;
        if (order.PaymentDate) return 1;
        return 0;
    };

    const formatDate = (date?: string) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-");

    // Mở modal đánh giá
    const openReviewModal = (orderId: string) => {
        setCurrentOrderId(orderId);
        setReviewText("");
        setRating(5);
        setIsModalVisible(true);
    };

    // Gửi đánh giá
    const submitReview = async () => {
        if (!currentOrderId) return;

        setSubmitLoading(true);
        try {
            await axios.post("/api/Review", {
                orderId: currentOrderId,
                rating,
                comment: reviewText
            });
            message.success("Đánh giá sản phẩm thành công");
            setIsModalVisible(false);
        } catch (err: any) {
            message.error(err.response?.data || "Đánh giá thất bại");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Spin spinning={loading}>
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={orders}
                renderItem={(order) => (
                    <List.Item key={order.Id}>
                        <Card
                            title={`Mã đơn: ${order.Id}`}
                            extra={`Tổng: ${order.TotalAmount.toLocaleString()} VNĐ`}
                        >
                            {/* Timeline trạng thái */}
                            <Steps current={getCurrentStep(order)} size="small">
                                <Step title="Đơn Hàng Đã Đặt" description={formatDate(order.Created)} />
                                <Step title="Đã Thanh Toán" description={formatDate(order.PaymentDate)} />
                                <Step title="Đã Giao Cho ĐVVC" description={formatDate(order.ShippedDate)} />
                                <Step title="Đã Nhận Hàng" description={formatDate(order.ReceivedDate)} />
                                <Step title="Hoàn Thành" description={formatDate(order.CompletedDate)} />
                            </Steps>

                            {/* Danh sách sản phẩm */}
                            <List
                                style={{ marginTop: 16 }}
                                dataSource={order.OrderItems}
                                renderItem={(item) => (
                                    <List.Item key={item.Id}>
                                        <List.Item.Meta
                                            avatar={item.ProductImage && (
                                                <img src={item.ProductImage} alt={item.ProductName} width={50} />
                                            )}
                                            title={item.ProductName}
                                            description={`Số lượng: ${item.Quantity} | Giá: ${item.Price.toLocaleString()} VNĐ`}
                                        />
                                    </List.Item>
                                )}
                            />

                            {/* Nút đánh giá nếu đơn đã hoàn thành */}
                            {order.CompletedDate && (
                                <Button
                                    type="primary"
                                    style={{ marginTop: 16 }}
                                    onClick={() => openReviewModal(order.Id)}
                                >
                                    Đánh giá sản phẩm
                                </Button>
                            )}
                        </Card>
                    </List.Item>
                )}
            />

            {/* Modal đánh giá */}
            <Modal
                title="Đánh giá sản phẩm"
                visible={isModalVisible}
                onOk={submitReview}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={submitLoading}
                okText="Gửi đánh giá"
            >
                <div style={{ marginBottom: 12 }}>
                    <span>Đánh giá sao: </span>
                    <Rate value={rating} onChange={(value) => setRating(value)} />
                </div>
                <TextArea
                    rows={4}
                    placeholder="Viết nhận xét của bạn..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                />
            </Modal>
        </Spin>
    );
};

export default MyPaidOrders;
