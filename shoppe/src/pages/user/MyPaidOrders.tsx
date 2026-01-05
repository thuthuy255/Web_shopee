// components/orders/MyPaidOrders.tsx
import React, { useEffect, useState } from "react";
import { Card, List, Steps, Button, message, Spin, Modal, Input, Rate } from "antd";
import axios from "axios" ;
import dayjs from "dayjs" ;
import { getMyPaidOrders } from "../../api/order/order.api";
import { formatCurrency } from "../../untils/FormatPrice";

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
            const res = await getMyPaidOrders();
            setOrders(res?.data);
        } catch (err: any) {
            message.error(err.response?.data || "Lấy đơn hàng thất bại");
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (date?: string) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-");

    // Mở modal đánh giá
    const openReviewModal = (orderId: string) => {
        setCurrentOrderId(orderId);
        setReviewText("");
        setRating(5);
        setIsModalVisible(true);
    };


    return (
        <Spin spinning={loading}>
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={orders}
                renderItem={(order: any) => (
                    <List.Item key={order?.id}>
                        <Card
                            title={`Mã đơn: ${order?.id}`}
                            extra={`Tổng: ${formatCurrency(order?.totalAmount)} VNĐ`}
                        >
                            {/* Timeline trạng thái */}
                            <Steps current={1} size="small">
                                <Step title="Đơn Hàng Đã Đặt" description={formatDate(order?.Created)} />
                                <Step title="Đã Thanh Toán" description={formatDate(order?.PaymentDate)} />
                                <Step title="Đã Nhận Hàng" description={formatDate(order?.ReceivedDate)} />
                                <Step title="Hoàn Thành" description={formatDate(order?.CompletedDate)} />
                            </Steps>

                            {/* Danh sách sản phẩm */}
                            <List
                                style={{ marginTop: 16 }}
                                dataSource={order?.orderItems || []} // chú ý: orderItems, không phải OrderItems
                                renderItem={(item: any) => (
                                    <List.Item key={item.id}>
                                        <List.Item.Meta
                                            avatar={
                                                item.productImage ? (
                                                    <img src={item.productImage} alt={item.productName} width={50} />
                                                ) : null
                                            }
                                            title={item.productName}
                                            description={`Số lượng: ${item.quantity} | Giá: ${item.price != null
                                                ? new Intl.NumberFormat("vi-VN").format(item.price) + " VNĐ"
                                                : "0 VNĐ"
                                                }`}
                                        />
                                    </List.Item>
                                )}
                            />


                            {/* Nút đánh giá nếu đơn đã hoàn thành */}
                            {order?.CompletedDate && (
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
                // onOk={submitReview}
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
