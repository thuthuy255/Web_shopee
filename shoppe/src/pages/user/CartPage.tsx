import { useEffect, useState, useMemo } from "react";
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
import { ArrowLeftOutlined, BarcodeOutlined, ShopOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { getCartState, setCart } from "../../features/slices/cart.slice";
import {
    getUserCartItems,
    removeCartItem,
    updateCartItem,
} from "../../api/cartitem/cartitem.api";
import LoadingDefault from "../../components/loading/LoadingDefault";
import { COLOR_DEFAULT } from "../../constants/Color";
import VoucherModal from "./VoucherModal";
import { showError, showSuccess, showWarning } from "../../untils/ShowToast";

const { Text } = Typography;

function CartPage() {
    const dispatch = useDispatch();
    const { data } = useSelector(getCartState);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Tổng tiền giỏ hàng (subtotal)
    const [cartTotal, setCartTotal] = useState<number>(0);
    // Voucher state
    const [isVoucherModalVisible, setVoucherModalVisible] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

    // Selected items state
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    // --- Fetch Cart ---
    const fetchCart = async () => {
        try {
            setLoading(true);
            const body = { pageInfo: { page: 1, pageSize: 20 }, keyWord: "" };
            const res: any = await getUserCartItems(body);
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
        fetchCart();
    }, []);

    // --- Tính tổng tiền khi selectedItems thay đổi ---
    useEffect(() => {
        const subtotal = selectedItems.reduce(
            (sum, item) =>
                sum + ((item.productVariant?.price ?? item.price) * item.quantity),
            0
        );
        setCartTotal(subtotal);

        // Nếu có voucher thì cập nhật lại discount
        if (appliedVoucher) {
            let discount = 0;
            if (appliedVoucher.discountPercent) {
                discount = (subtotal * appliedVoucher.discountPercent) / 100;
            } else if (appliedVoucher.minOrderValue && subtotal >= appliedVoucher.minOrderValue) {
                discount = appliedVoucher.discountAmount || 0;
            }
            setAppliedVoucher((prev: any) => ({ ...prev, discount }));
        }
    }, [selectedItems]);

    // --- Toggle item ---
    const handleToggleItem = (item: any, checked: boolean) => {
        setSelectedItems((prev) =>
            checked ? [...prev, item] : prev.filter((i) => i.id !== item.id)
        );
    };

    // --- Update quantity ---
    const handleQuantityChange = async (
        productId: string,
        productVariantId: string | null,
        quantity: number
    ) => {
        try {
            await updateCartItem({ productId, productVariantId, quantity });
            fetchCart();

            // Sync selected items
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
            const allItems = data.flatMap((seller) => seller.items);
            setSelectedItems(allItems);
        } else {
            setSelectedItems([]);
        }
    };

    const isAllSelected =
        data?.length > 0 &&
        selectedItems.length > 0 &&
        data.every((seller) =>
            seller.items.every((item) =>
                selectedItems.some((sel) => sel.id === item.id)
            )
        );

    const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

    // --- Apply Voucher ---
    const handleApplyVoucher = (voucher: any) => {
        if (!voucher) {
            setAppliedVoucher(null);
            message.info("Voucher đã được bỏ chọn.");
            return;
        }

        let discount = 0;
        if (voucher.discountPercent) {
            discount = (cartTotal * voucher.discountPercent) / 100;
        } else if (voucher.minOrderValue && cartTotal >= voucher.minOrderValue) {
            discount = voucher.discountAmount || 0;
        }

        setAppliedVoucher({ ...voucher, discount });
        message.success(`Voucher ${voucher.code} đã được áp dụng!`);
    };

    // --- Final Price ---
    const finalPrice = useMemo(
        () => Math.max(0, cartTotal - (appliedVoucher?.discount || 0)),
        [cartTotal, appliedVoucher]
    );

    // --- Checkout ---
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            showWarning("Vui lòng chọn ít nhất 1 sản phẩm để mua");
            return;
        }

        const checkoutItems = selectedItems.map(item => {
            const unitPrice = item.productVariant?.price ?? item.price;
            return {
                ...item,
                price: unitPrice
            };
        });

        const cartItemIds = checkoutItems.map((i) => i.id);

        navigate("/user/checkout", {
            state: { items: checkoutItems, cartItemIds, appliedVoucher },
        });
    };


    // --- Delete item ---
    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await removeCartItem(id);
            showSuccess("Đã xoá sản phẩm khỏi giỏ hàng");
            fetchCart();
            setSelectedItems((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            showError("Xoá sản phẩm thất bại");
        } finally {
            setLoading(false);
        }
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
                    <Card key={itemsCart?.sellerId} style={{ marginBottom: 20 }}>
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

                        {itemsCart.items?.map((item) => {
                            const unitPrice = item?.productVariant?.price ?? item.price;
                            const lineTotal = unitPrice * item.quantity;

                            return (
                                <Flex
                                    key={item.id}
                                    align="center"
                                    gap={10}
                                    style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}
                                >
                                    <Checkbox
                                        checked={selectedItems.some((i) => i.id === item.id)}
                                        onChange={(e) => handleToggleItem(item, e.target.checked)}
                                    />
                                    <Image
                                        src={item?.thumbnail}
                                        alt={item?.productName}
                                        width={60}
                                        height={60}
                                        style={{ objectFit: "contain", borderRadius: 4, backgroundColor: "#f0f0f0" }}
                                        preview={false}
                                    />
                                    <div style={{ flex: 2 }}>
                                        <Link to={`/user/products/{item?.productId}`}>
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
                                        {item?.productVariant && (
                                            <div style={{ color: "gray", fontSize: 13 }}>
                                                {item?.productVariant?.variantName}: {item?.productVariant?.variantValue}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, textAlign: "center" }}>
                                        {unitPrice.toLocaleString("vi-VN")} đ
                                    </div>
                                    <div style={{ flex: 1, textAlign: "center" }}>
                                        <InputNumber
                                            min={1}
                                            max={item?.stockQuantity}
                                            value={item?.quantity}
                                            onChange={(value) =>
                                                handleQuantityChange(item?.productId, item?.productVariantId ?? null, value || 1)
                                            }
                                        />
                                    </div>
                                    <div style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
                                        {lineTotal.toLocaleString("vi-VN")} đ
                                    </div>
                                    <div style={{ flex: 1, textAlign: "center" }}>
                                        <Button type="link" danger onClick={() => handleDelete(item.id)}>
                                            Xóa
                                        </Button>
                                    </div>
                                </Flex>
                            );
                        })}
                    </Card>
                ))}

                {/* Tổng cộng */}
                {/* Tổng cộng */}
                <Card style={{ position: "sticky", bottom: 0, zIndex: 100, background: "#fff" }}>
                    <Flex justify="space-between" align="center">
                        <Flex align="center">
                            <BarcodeOutlined style={{ fontSize: 23, color: COLOR_DEFAULT }} />
                            <Text style={{ marginLeft: 8, fontSize: 16 }}>Shopping Voucher</Text>
                            <Text
                                style={{ marginLeft: 16, cursor: "pointer", color: "#20609bff" }}
                                onClick={() => setVoucherModalVisible(true)}
                            >
                                Chọn hoặc nhập mã
                            </Text>
                        </Flex>

                        <Flex align="center" gap={20}>
                            <Text strong>
                                Tổng cộng ({selectedItems.length} sản phẩm đã chọn):
                            </Text>
                            <Text strong type="danger" style={{ fontSize: 18 }}>
                                {finalPrice.toLocaleString("vi-VN")} đ
                            </Text>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {appliedVoucher && (
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            backgroundColor: "#e6f7ff",
                                            border: "1px dashed #1890ff",
                                            borderRadius: 6,
                                            padding: "4px 10px",
                                            marginLeft: 12,
                                        }}
                                    >
                                        <BarcodeOutlined style={{ color: "#1890ff", marginRight: 6 }} />
                                        <span style={{ color: "#1890ff", fontWeight: 600 }}>
                                            {appliedVoucher.code || `Giảm ${appliedVoucher.discountPercent}%`}
                                        </span>
                                    </div>
                                )}

                                <Button
                                    type="primary"
                                    style={{ backgroundColor: COLOR_DEFAULT }}
                                    size="large"
                                    // disabled={finalPrice === 0}
                                    onClick={handleCheckout}
                                >
                                    Mua hàng
                                </Button>
                            </div>
                        </Flex>
                    </Flex>
                </Card>


                {/* Voucher Modal */}
                <VoucherModal
                    visible={isVoucherModalVisible}
                    onClose={() => setVoucherModalVisible(false)}
                    onApply={handleApplyVoucher}
                    cartTotal={cartTotal}   // <-- thêm prop này
                />

            </div>
        </div>
    );
}

export default CartPage;
