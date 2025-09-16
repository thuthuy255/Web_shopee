import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Checkbox,
    Flex,
    Image,
    InputNumber,
    Typography,
    Card,
    Button,
    message,
} from "antd";
import { BarcodeOutlined, ShopOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { getCartState, setCart } from "../../features/slices/cart.slice";
import {
    getUserCartItems,
    updateCartItem,
} from "../../api/cartitem/cartitem.api";
import LoadingDefault from "../../components/loading/LoadingDefault";
import { COLOR_DEFAULT } from "../../constants/Color";
import VoucherModal from "./VoucherModal";

const { Text } = Typography;

function CartPage() {
    const dispatch = useDispatch();
    const { data } = useSelector(getCartState);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Voucher state
    const [isVoucherModalVisible, setVoucherModalVisible] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

    // Selected items state
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    // --- Fetch Cart ---
    const fetchCart = async (page: number) => {
        try {
            setLoading(true);
            const body = { pageInfo: { page, pageSize }, keyWord: "" };
            const res: any = await getUserCartItems(body);
            setTotal(res?.totalRecord);
            setCurrentPage(page);
            dispatch(
                setCart({
                    data: res?.data,
                    totalRecord: res?.totalRecord || 0,
                    totalCartItem: res?.totalCartItem || 0,
                })
            );
        } catch (err) {
            console.error("Lỗi khi load giỏ hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart(currentPage);
    }, []);

    // --- Toggle item ---
    const handleToggleItem = (
        productId: string,
        checked: boolean,
        productVariantId: string | null,
        quantity: number,
        price: number,
        productName: string,
        thumbnail: string,
    ) => {
        if (checked) {
            setSelectedItems((prev) => [
                ...prev,
                { productId, productVariantId, quantity, price, productName, thumbnail },
            ]);
        } else {
            setSelectedItems((prev) =>
                prev.filter(
                    (item) =>
                        item.productId !== productId ||
                        (item.productVariantId ?? null) !== (productVariantId ?? null)
                )
            );
        }
    };

    // --- Update quantity ---
    const handleQuantityChange = async (
        productId: string,
        productVariantId: string | null,
        quantity: number
    ) => {
        try {
            const body = { productId, productVariantId, quantity };
            await updateCartItem(body);
            fetchCart(currentPage);

            // Cập nhật lại selectedItems nếu item này đang được chọn
            setSelectedItems((prev) =>
                prev.map((item) =>
                    item.productId === productId &&
                        (item.productVariantId ?? null) === (productVariantId ?? null)
                        ? { ...item, quantity }
                        : item
                )
            );
        } catch (err) {
            console.error("Update thất bại:", err);
        }
    };

    // --- Toggle all ---
    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            const allItems = data.flatMap((seller) =>
                seller.items.map((item) => ({
                    productId: item.productId,
                    productVariantId: item.productVariantId,
                    quantity: item.quantity,
                    price: item.price,
                }))
            );
            setSelectedItems(allItems);
        } else {
            setSelectedItems([]);
        }
    };

    const isAllSelected =
        (data?.length ?? 0) > 0 &&
        selectedItems.length > 0 &&
        data.every((seller) =>
            seller.items.every((item) =>
                selectedItems.some(
                    (sel) =>
                        sel.productId === item.productId &&
                        (sel.productVariantId ?? null) === (item.productVariantId ?? null)
                )
            )
        );

    const isIndeterminate =
        selectedItems.length > 0 && !isAllSelected;

    // --- Voucher ---
    const handleApplyVoucher = (voucher: any) => {
        if (!voucher) {
            setAppliedVoucher(null);
            message.info("Voucher đã được bỏ chọn.");
            return;
        }

        const subtotal = selectedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        let discount = 0;
        if (voucher.discountPercent) {
            discount = (subtotal * voucher.discountPercent) / 100;
        } else if (voucher.minOrderValue && subtotal >= voucher.minOrderValue) {
            discount = voucher.discountAmount || 0;
        }

        setAppliedVoucher({ ...voucher, discount });
        message.success(`Voucher ${voucher.code} đã được áp dụng!`);
    };

    const getTotalPriceAfterVoucher = () => {
        const total = selectedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        if (!appliedVoucher) return total;
        return Math.max(0, total - (appliedVoucher.discount || 0));
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("Bạn chưa chọn sản phẩm nào!");
            return;
        }
        navigate("/user/checkout", { state: { items: selectedItems } });
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ height: "80vh" }}>
                <LoadingDefault />
            </Flex>
        );
    }

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "50vh", padding: "1px 0" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>
                {/* Header giỏ hàng */}
                <Card style={{ marginBottom: 20 }}>
                    <Flex justify="space-between" align="center">
                        <div style={{ flex: 2.5, display: "flex", alignItems: "center" }}>
                            <Checkbox
                                indeterminate={isIndeterminate}
                                checked={isAllSelected}
                                onChange={(e) => handleToggleAll(e.target.checked)}
                            >
                                Sản phẩm
                            </Checkbox>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>Đơn Giá</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Số Lượng</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Số Tiền</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Thao Tác</div>
                    </Flex>
                </Card>

                {/* Danh sách shop + sản phẩm */}
                {data?.map((itemsCart) => (
                    <Card key={itemsCart.sellerId} style={{ marginBottom: 20 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 10,
                                fontWeight: "bold",
                                fontSize: 16,
                                borderBottom: "1px solid #ddd",
                                paddingBottom: 10,
                            }}
                        >
                            <ShopOutlined style={{ fontSize: 18 }} />
                            <Text>{itemsCart.sellerName}</Text>
                        </div>

                        {itemsCart.items?.map((item) => (
                            <Flex
                                key={item.id}
                                align="center"
                                gap={10}
                                style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}
                            >
                                <Checkbox
                                    checked={selectedItems.some(
                                        (i) =>
                                            i.productId === item.productId &&
                                            (i.productVariantId ?? null) === (item.productVariantId ?? null)
                                    )}
                                    onChange={(e) =>
                                        handleToggleItem(
                                            item.productId,
                                            e.target.checked,
                                            item.productVariantId,
                                            item.quantity,
                                            item.price,
                                            item.productName,
                                            item.thumbnail
                                        )
                                    }
                                />
                                <div style={{ width: 60, textAlign: "center" }}>
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.productName}
                                        width={60}
                                        height={60}
                                        style={{ objectFit: "contain", borderRadius: 4, backgroundColor: "#f0f0f0" }}
                                        preview={false}
                                    />
                                </div>
                                <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 10 }}>
                                    <div>
                                        <Link to={`/user/products/${item.productId}`}>
                                            <Text
                                                style={{
                                                    display: "block",
                                                    maxWidth: 200,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {item.productName}
                                            </Text>
                                        </Link>
                                        <div style={{ color: "gray", fontSize: 13 }}>
                                            {item.variantValue && <span>Màu: {item.variantValue} </span>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    {item.price.toLocaleString("vi-VN")} đ
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <InputNumber
                                        min={1}
                                        max={item.stockQuantity}
                                        value={item.quantity}
                                        onChange={(value) =>
                                            handleQuantityChange(item.productId, item.productVariantId, value || 1)
                                        }
                                    />
                                </div>
                                <div style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
                                    {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                                </div>
                                <div style={{ flex: 1, textAlign: "center" }}>
                                    <Button type="link" danger>
                                        Xóa
                                    </Button>
                                </div>
                            </Flex>
                        ))}
                    </Card>
                ))}

                {/* Tổng cộng */}
                <Card style={{ position: "sticky", bottom: 0, zIndex: 100, background: "#fff" }}>
                    <div style={{ gap: "20px", display: "flex", flexDirection: "column" }}>
                        <Flex style={{ width: "100%", textAlign: "center" }} justify="flex-end" align="center" gap={50}>
                            <Flex align="center">
                                <BarcodeOutlined style={{ fontSize: "23px", color: COLOR_DEFAULT }} />
                                <Text style={{ marginLeft: 8, fontSize: "16px" }}>Shopping Voucher</Text>
                            </Flex>
                            <Text
                                style={{ cursor: "pointer", color: "#20609bff", fontSize: "14px" }}
                                onClick={() => setVoucherModalVisible(true)}
                            >
                                Chọn hoặc nhập mã
                            </Text>
                        </Flex>
                        <div style={{ display: "flex", width: "100%", height: 1, borderTop: "1px dashed #ccc" }} />
                        <Flex justify="space-between" align="center">
                            <Text strong>
                                Tổng cộng ({selectedItems.length} sản phẩm đã chọn):
                            </Text>
                            <Text strong type="danger" style={{ fontSize: 18 }}>
                                {getTotalPriceAfterVoucher().toLocaleString("vi-VN")} đ
                            </Text>
                            <Flex gap={8}>
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: COLOR_DEFAULT }}
                                    size="large"
                                    disabled={getTotalPriceAfterVoucher() === 0}
                                    onClick={handleCheckout}
                                >
                                    Mua hàng
                                </Button>
                            </Flex>
                        </Flex>
                    </div>
                </Card>

                {/* Voucher Modal */}
                <VoucherModal
                    visible={isVoucherModalVisible}
                    onClose={() => setVoucherModalVisible(false)}
                    onApply={handleApplyVoucher}
                />
            </div>
        </div>
    );
}

export default CartPage;
