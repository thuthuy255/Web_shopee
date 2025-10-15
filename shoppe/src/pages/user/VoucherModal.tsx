import { useState, useEffect } from "react";
import { Modal, Typography, Spin, Tag, Image, Flex } from "antd";
import { getPromotions } from "../../api/promotion/promotion.api";
const { Text } = Typography;
import logo_voucher from "../../assets/img/voucher.png";

interface Voucher {
    code: string;
    name: string;
    description?: string;
    discountPercent?: number;
    minOrderValue?: number;
    discountAmount?: number;
    startDate: string;
    endDate: string;
}

interface VoucherModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (voucher: Voucher | null) => void;
    cartTotal: number; // ✅ thêm tổng giá trị giỏ hàng
}

const VoucherModal = ({ visible, onClose, onApply, cartTotal }: VoucherModalProps) => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) fetchVouchers();
    }, [visible]);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res: any = await getPromotions({ pageInfo: { page: 1, pageSize: 50 } });

            // ✅ Chỉ lấy những voucher có trạng thái Active
            const activeVouchers = (res.data || []).filter(
                (v: any) => v.status === "Active"
            );

            setVouchers(activeVouchers);
        } catch (err) {
            console.error("Lỗi load voucher:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleApply = () => {
        onApply(selectedVoucher);
        onClose();
    };

    return (
        <Modal
            title="Chọn Shopee Voucher"
            open={visible}
            onCancel={onClose}
            onOk={handleApply}
            okText="OK"
            cancelText="Trở lại"
        >
            {loading ? (
                <Spin />
            ) : (
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {vouchers.map((item) => {
                        const isDisabled = item.minOrderValue && cartTotal < item.minOrderValue;

                        return (
                            <div
                                key={item.code}
                                onClick={() =>
                                    !isDisabled &&
                                    setSelectedVoucher(
                                        selectedVoucher?.code === item.code ? null : item
                                    )
                                }
                                style={{
                                    border: "1px solid #f0f0f0",
                                    borderRadius: 6,
                                    marginBottom: 12,
                                    padding: 12,
                                    display: "flex",
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                    backgroundColor:
                                        selectedVoucher?.code === item.code ? "#e6f7ff" : "#fff",
                                    opacity: isDisabled ? 0.5 : 1, // ✅ làm mờ nếu không đủ điều kiện
                                }}
                            >
                                <div
                                    style={{
                                        width: 80,
                                        minWidth: 80,
                                        height: 40,
                                        background: "#f5f5f5",
                                        borderRadius: 4,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        color: "#1890ff",
                                        marginRight: 12,
                                    }}
                                >
                                    <Image src={logo_voucher} style={{ width: "100%" }} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <Text strong style={{ fontSize: 15, display: "block" }}>
                                        {item.discountPercent
                                            ? `Giảm ${item.discountPercent}%`
                                            : item.discountAmount
                                                ? `Giảm ${item.discountAmount.toLocaleString()}đ`
                                                : ""}
                                    </Text>

                                    <Flex align="center" justify="space-between">
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            Đơn tối thiểu {item.minOrderValue?.toLocaleString()}đ
                                        </Text>

                                        {isDisabled && (
                                            <Tag color="default">Không đủ điều kiện</Tag>
                                        )}

                                        {item.description && !isDisabled && (
                                            <Tag
                                                color="red"
                                                style={{ marginTop: 6, display: "inline-block" }}
                                            >
                                                {item.description}
                                            </Tag>
                                        )}
                                    </Flex>

                                    <div style={{ marginTop: 6, fontSize: 12 }}>
                                        <Text type="secondary">HSD: {item.endDate}</Text>{" "}
                                        <a href="#">Điều kiện</a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
};

export default VoucherModal;
