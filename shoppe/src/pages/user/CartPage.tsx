// pages/CartPage.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Checkbox,
    Flex,
    Image,
    InputNumber,
    Typography,
    Divider,
    Button,
    Card,
    Spin,
} from "antd";
import { getCartState, setCart } from "../../features/slices/cart.slice";
import { COLOR_DEFAULT } from "../../constants/Color";
import {
    getUserCartItems,
    toggleCartItemSelection,
    toggleSelectAllCart,
} from "../../api/cartitem/cartitem.api";
import LoadingDefault from "../../components/loading/LoadingDefault";
import { ShopOutlined } from '@ant-design/icons';

const { Text } = Typography;

function CartPage() {
    const dispatch = useDispatch();
    const { data, totalCartItem } = useSelector(getCartState);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // ✅ Lấy giỏ hàng từ backend
    const fetchCart = async (page: number) => {
        try {
            setLoading(true);
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: "",
            };
            const res: any = await getUserCartItems(body);
            setTotal(res?.totalRecord || res?.data?.length || 0);
            setCurrentPage(page);

            // ✅ dispatch đúng format cho slice
            dispatch(
                setCart({
                    data: res.data || [],
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

    const handleToggleItem = async (
        productId: string,
        checked: boolean,
        productVariantId: string | null
    ) => {
        try {
            // Clone state để Redux detect thay đổi
            const updatedData = data.map((seller) => ({
                ...seller,
                items: seller.items.map((item) =>
                    item.productId === productId &&
                        (item.productVariantId ?? null) === (productVariantId ?? null)
                        ? { ...item, isSelected: checked }
                        : item
                ),
            }));

            // Dispatch cập nhật local
            dispatch(
                setCart({
                    data: updatedData,
                    totalRecord: total,
                    totalCartItem: totalCartItem,
                })
            );

            // Gọi API backend
            await toggleCartItemSelection(productId, checked, productVariantId);
        } catch (err) {
            console.error("Lỗi khi toggle item:", err);
        }
    };





    const handleToggleAll = async () => {
        try {
            await toggleSelectAllCart();
            fetchCart(currentPage);
        } catch (err) {
            console.error(err);
        }
    };

    const getTotalPrice = () => {
        if (!data || data.length === 0) return 0;
        return data.reduce((total, seller) => {
            if (!seller.items) return total;
            return (
                total +
                seller.items.reduce((sellerTotal, item) => {
                    return item.isSelected
                        ? sellerTotal + item.price * item.quantity
                        : sellerTotal;
                }, 0)
            );
        }, 0);
    };

    const isAllSelected =
        (data?.length ?? 0) > 0 &&
        data.every((seller) => seller.items?.every((item) => item.isSelected));

    const isIndeterminate =
        !isAllSelected &&
        data?.some((seller) => seller.items?.some((item) => item.isSelected));

    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ height: "80vh" }}>
                <LoadingDefault />
            </Flex>
        );
    }

    return (
        <div style={{ padding: 20, backgroundColor: "#f5f5f5", minHeight: "50vh" }}>
            <Card style={{ marginBottom: 20 }}>
                <Flex justify="space-between" >
                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <Checkbox indeterminate={isIndeterminate} checked={isAllSelected} onChange={handleToggleAll}>
                            Sản phẩm
                        </Checkbox>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>Đơn Giá</div>
                    <div style={{ flex: 1, textAlign: "center" }}>Số Lượng</div>
                    <div style={{ flex: 1, textAlign: "center" }}>Số Tiền</div>
                    <div style={{ flex: 1, textAlign: "center" }}>Thao Tác</div>
                </Flex>
            </Card>

            {data?.map((itemsCart) => (
                <Card key={itemsCart.sellerId} style={{ marginBottom: 20 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12, // khoảng cách giữa icon và text
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
                            style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}
                        >
                            {/* Sản phẩm */}
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
                                <Checkbox
                                    checked={item.isSelected}
                                    onChange={(e) =>
                                        handleToggleItem(item.productId, e.target.checked, item.productVariantId)
                                    }
                                />
                                <Image
                                    src={item.thumbnail}
                                    alt={item.productName}
                                    width={60}
                                    height={60}
                                    style={{ objectFit: "contain", backgroundColor: "#f0f0f0", borderRadius: 4 }}
                                    preview={false}
                                />

                                <div>
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
                                    <div style={{ color: "gray", fontSize: 13 }}>
                                        {item.color && <span>Màu: {item.color} </span>}
                                        {item.size && <span> | Size: {item.size}</span>}
                                    </div>
                                </div>

                            </div>

                            {/* Đơn Giá */}
                            <div style={{ flex: 1, textAlign: "center" }}>
                                {item.price.toLocaleString("vi-VN")} đ
                            </div>

                            {/* Số lượng */}
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <InputNumber
                                    min={1}
                                    max={item.stockQuantity}
                                    value={item.quantity}
                                />
                            </div>

                            {/* Số Tiền */}
                            <div style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
                                {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                            </div>

                            {/* Thao Tác */}
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <Button type="link" danger >
                                    Xóa
                                </Button>
                            </div>
                        </Flex>
                    ))}
                </Card>
            ))}

            {/* Tổng cộng */}
            <Card>
                <Flex justify="space-between" align="center">
                    <Text strong>
                        Tổng cộng ({totalCartItem} sản phẩm đã chọn):
                    </Text>
                    <Text strong type="danger" style={{ fontSize: 18 }}>
                        {getTotalPrice().toLocaleString("vi-VN")} đ
                    </Text>
                    <Button
                        type="primary"
                        style={{ backgroundColor: COLOR_DEFAULT }}
                        size="large"
                        disabled={getTotalPrice() === 0}
                    >
                        Mua hàng
                    </Button>
                </Flex>
            </Card>
        </div>


    );
}

export default CartPage;
