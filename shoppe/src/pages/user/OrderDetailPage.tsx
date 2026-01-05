import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
    Flex,
} from "antd";
import {
    createOrder,
    getOrderDetail,
    paymentOrder,
} from "../../api/order/order.api";
import { getUserAddresses } from "../../api/address/address.api";
import AddressManagement from "./AddressManagement";
import { formatCurrency } from "../../untils/FormatPrice";
import VoucherModal from "./VoucherModal";
import { ArrowLeftOutlined, BarcodeOutlined, CloseOutlined } from "@ant-design/icons";
import { COLOR_DEFAULT } from "../../constants/Color";

const { Text, Title } = Typography;

// ------------------ Types ------------------
interface OrderItem {
    id?: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    thumbnail: string;
    productVariantId?: string | null;
    variantName?: string | null;
    variantValue?: string | null;
    priceVariant?: number | null;
}

interface Order {
    id: string;
    status: string;
    orderItems: OrderItem[];
    totalAmount: number;
    originalAmount: number;
    addressId?: string;
    promotionCode?: string | null;
    paymentMethod?: string;
}

interface Address {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressDetail: string;
    city?: string;
    province?: string;
    isDefault?: boolean;
}

interface Voucher {
    code: string;
    discountAmount?: number;
    discountPercent?: number;
}

// ------------------ Component ------------------
const OrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const location = useLocation();
    const selectedItems: OrderItem[] = location.state?.items || [];
    const cartItemIds: string[] = location.state?.cartItemIds || [];
    const navigate = useNavigate();
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [cartTotal, setCartTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail(orderId);
        } else if (selectedItems.length > 0) {
            const totalAmount = selectedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            setOrder({
                id: "TEMP-CHECKOUT",
                status: "Pending",
                orderItems: selectedItems,
                totalAmount,
                originalAmount: totalAmount,
                paymentMethod: "VNPay",
            });
            setCartTotal(totalAmount);
        }
        fetchAddresses();
    }, [orderId]);

    // Lấy chi tiết đơn hàng
    const fetchOrderDetail = async (id: string) => {
        setLoading(true);
        try {
            const res: any = await getOrderDetail(id);
            if (!res) {
                message.error("Không tìm thấy đơn hàng.");
                return;
            }
            setOrder({
                ...res,
                originalAmount: res.originalAmount ?? res.totalAmount,
            });
        } catch (error) {
            console.error(error);
            message.error("Không thể tải chi tiết đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    // Lấy địa chỉ người dùng
    const fetchAddresses = async () => {
        try {
            const res: any = await getUserAddresses();
            const list: Address[] = Array.isArray(res) ? res : res.data || [];
            setAddresses(list);

            if (!selectedAddressId) {
                const defaultAddr = list.find((a) => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                }
            }
        } catch (error) {
            console.error(error);
            message.error("Không thể tải địa chỉ.");
        }
    };

    // Khi chọn voucher
    const handleApplyVoucher = (voucher: Voucher | null) => {
        if (!order) return;

        // ✅ Nếu voucher null hoặc bấm lại đúng voucher đang chọn → bỏ chọn
        if (
            !voucher ||
            (selectedVoucher && voucher && selectedVoucher.code === voucher.code)
        ) {
            setSelectedVoucher(null);
            setOrder({
                ...order,
                promotionCode: null,
                totalAmount: order.originalAmount,
            });
            setCartTotal(order.originalAmount);
            message.info("Đã bỏ chọn voucher.");
            return;
        }

        // ✅ Ngược lại: áp dụng voucher mới
        let newTotal = order.originalAmount;

        if (voucher.discountAmount) {
            newTotal -= voucher.discountAmount;
        } else if (voucher.discountPercent) {
            newTotal -= (order.originalAmount * voucher.discountPercent) / 100;
        }

        if (newTotal < 0) newTotal = 0;

        setSelectedVoucher(voucher);
        setOrder({
            ...order,
            promotionCode: voucher.code,
            totalAmount: newTotal,
        });
        setCartTotal(newTotal);
        message.success(`Đã áp dụng mã: ${voucher.code}`);
    };


    // ------------------ Thanh toán ------------------
    const handlePayment = async () => {
        if (!order) return;
        if (!selectedAddressId) {
            message.warning("Vui lòng chọn địa chỉ giao hàng trước.");
            return;
        }

        try {
            setLoading(true);
            let orderIdToPay = order.id;
            let totalAmount = order.totalAmount;

            // Nếu là checkout tạm thì tạo order mới
            if (orderIdToPay === "TEMP-CHECKOUT") {
                const payload = {
                    addressId: selectedAddressId,
                    promotionCode: order.promotionCode || null,
                    paymentMethod: order.paymentMethod || "VNPay",
                    items: order.orderItems.map((i) => ({
                        productId: i.productId,
                        productVariantId: i.productVariantId ?? null,
                        quantity: i.quantity,
                    })),
                    cartItemIds,
                };

                const res: any = await createOrder(payload);
                if (!res?.success || !res.data) {
                    message.error(res?.message || "Không thể tạo đơn hàng.");
                    return;
                }

                orderIdToPay = res.data.id;
                totalAmount = res.data.totalAmount;

                setOrder((prev) =>
                    prev
                        ? {
                            ...prev,
                            id: orderIdToPay,
                            totalAmount: totalAmount,
                            originalAmount: res.data.originalAmount ?? totalAmount,
                        }
                        : null
                );
            }

            // Gọi API thanh toán
            const payReq = { orderId: orderIdToPay, amount: totalAmount };
            const payRes: any = await paymentOrder(payReq);

            if (payRes?.paymentUrl) {
                window.open(payRes.paymentUrl, "_blank"); // Mở trong tab mới
            } else {
                message.error("Không lấy được link thanh toán.");
            }
        } catch (err) {
            console.error("🚀 ~ handlePayment error:", err);
            message.error("Thanh toán thất bại.");
        } finally {
            setLoading(false);
        }
    };

    // Lấy địa chỉ hiển thị
    const orderAddress: Address | null =
        addresses.find((a) => a.id === selectedAddressId) ||
        (order?.addressId ? addresses.find((a) => a.id === order.addressId) || null : null);

    if (loading && !order) {
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: "24px 16px", maxWidth: "80%", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#555",
                        fontWeight: 500,
                    }}
                    onClick={() => navigate('/user')}
                >
                    Quay lại
                </Button>
            </div>

            <Card
                style={{ borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                bodyStyle={{ padding: 24 }}
            >
                {/* Địa chỉ giao hàng */}
                <Card type="inner" title="Địa chỉ giao hàng" style={{ marginBottom: 16 }}>
                    {orderAddress ? (
                        <>
                            <div style={{ marginBottom: 4 }}>
                                <Text strong>
                                    {orderAddress.fullName} - {orderAddress.phoneNumber}
                                </Text>
                            </div>
                            <Flex gap={16} justify="space-between" align="center">
                                <div style={{ marginBottom: 8, color: "rgba(0,0,0,0.75)" }}>
                                    {orderAddress.addressDetail}
                                    {orderAddress.city ? `, ${orderAddress.city}` : ""}
                                    {orderAddress.province ? `, ${orderAddress.province}` : ""}
                                </div>
                                <div>
                                    {orderAddress.isDefault && (
                                        <Tag color="blue" style={{ marginRight: 8 }}>
                                            Mặc định
                                        </Tag>
                                    )}
                                    <Button type="link" onClick={() => setIsAddressModalOpen(true)}>
                                        Chọn/Sửa địa chỉ
                                    </Button>
                                </div>
                            </Flex>
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
                {order?.orderItems?.map((item, idx) => (
                    <Card
                        key={item.id || idx}
                        hoverable
                        style={{ marginBottom: 16, borderRadius: 10 }}
                        bodyStyle={{ padding: 16 }}
                    >
                        <Row gutter={16} align="middle">
                            <Col span={6}>
                                <img
                                    src={item.thumbnail}
                                    alt={item.productName}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                            </Col>
                            <Col span={12}>
                                <Title level={5}>{item.productName || "Tên sản phẩm"}</Title>
                                <Text type="secondary">Số lượng: {item.quantity}</Text>
                                {item.variantName && (
                                    <div>
                                        <Text type="secondary">
                                            {item.variantName}: {item.variantValue}
                                        </Text>
                                    </div>
                                )}
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

               {/* Voucher */}
<Row style={{ marginBottom: 16 }}>
  <Col span={24}>
    <Flex justify="space-between" align="center">
      <Flex align="center">
        <BarcodeOutlined style={{ fontSize: "23px", color: COLOR_DEFAULT }} />
        <Text style={{ marginLeft: 8, fontSize: "16px" }}>Shopping Voucher</Text>
      </Flex>

      {selectedVoucher ? (
        // ✅ Nếu đã chọn voucher: hiển thị box + cho phép bấm để bỏ chọn
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "#e6f7ff",
            border: "1px dashed #1890ff",
            borderRadius: 6,
            padding: "4px 10px",
            cursor: "pointer",
            gap: 8,
          }}
          onClick={() => handleApplyVoucher(null)}
        >
          <BarcodeOutlined style={{ color: "#1890ff" }} />
          <span style={{ color: "#1890ff", fontWeight: 600 }}>
            {selectedVoucher.code ||
              `Giảm ${selectedVoucher.discountPercent}%`}
          </span>
          <CloseOutlined style={{ color: "#1890ff", fontWeight: 600 }} />
        </div>
      ) : (
        // ✅ Nếu chưa chọn voucher: chỉ hiển thị 1 nút link duy nhất
        <Button
          type="link"
          onClick={() => setIsVoucherModalOpen(true)}
          style={{ color: "#20609bff", fontWeight: 500 }}
        >
          Chọn voucher
        </Button>
      )}
    </Flex>
  </Col>
</Row>


                {/* Tổng tiền + Thanh toán */}
                <Row justify="space-between" align="middle">
                    <Col></Col>
                    <Col style={{ textAlign: "right" }}>
                        <Title level={3} style={{ color: "#1890ff" }}>
                            Tổng: {formatCurrency(order?.totalAmount || 0)}
                        </Title>
                        {order?.paymentMethod && (
                            <Text type="secondary">Thanh toán: {order.paymentMethod}</Text>
                        )}
                        <div style={{ marginTop: 16 }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handlePayment}
                                loading={loading}
                            >
                                Thanh toán
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Modal quản lý địa chỉ */}
            <AddressManagement
                visible={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSaved={fetchAddresses}
                selectedId={selectedAddressId || order?.addressId || null}
                onSelect={(id) => setSelectedAddressId(id)}
            />

            {/* Modal chọn voucher */}
            <VoucherModal
                visible={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                onApply={handleApplyVoucher}
                cartTotal={cartTotal}
            />
        </div>
    );
};

export default OrderDetail;
