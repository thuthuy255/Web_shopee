import React, { useEffect } from 'react';
import {
    Checkbox,
    Button,
    InputNumber,
    Image,
    Typography,
    Divider,
    Row,
    Col
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    getUserCartItems,
    toggleCartItemSelection,
    toggleSelectAllCart,
} from '../../api/cartitem/cartitem.api';
import {
    setCartItems,
    updateQuantity,
    toggleItemSelection,
    toggleSelectAll,
    removeSelectedItems,
} from '../../features/slices/cart.slice';
import type { RootState } from '../../features/store';

const { Text } = Typography;

const CartPage = () => {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.app.token);
    const groupedItems = useSelector((state: RootState) => state.cart.groupedItems);

    useEffect(() => {
        if (token) {
            fetchCart();
        }
    }, [token]);

    const fetchCart = async () => {
        try {
            const res = await getUserCartItems();
            // Giả sử API trả về đúng cấu trúc groupedItems
            dispatch(setCartItems(res.data));
        } catch (err) {
            console.error(err);
        }
    };

    const handleQuantityChange = (id: string, value: number | null) => {
        dispatch(updateQuantity({
            id,
            quantity: value ?? 1
        }));
    };

    const handleToggleSelection = async (id: string, isSelected: boolean) => {
        try {
            await toggleCartItemSelection(id, isSelected);
            dispatch(toggleItemSelection({ id, isSelected }));
        } catch (err) {
            console.error(err);
        }
    };

    const allItems = groupedItems.flatMap(g => g.items);
    const allSelected = allItems.length > 0 && allItems.every(i => i.isSelected);
    const someSelected = allItems.some(i => i.isSelected);

    const handleToggleAll = async (checked: boolean) => {
        try {
            await toggleSelectAllCart();
            dispatch(toggleSelectAll(checked));
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveSelected = () => {
        dispatch(removeSelectedItems());
    };

    // Lọc items đã chọn để tính tổng
    const selectedItems = allItems.filter(i => i.isSelected);

    const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <div style={{ width: '85%', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Row
                gutter={16}
                style={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ddd',
                    paddingBottom: 10,
                    paddingLeft: 30,
                }}
            >
                <Col span={8}>Sản phẩm</Col>
                <Col span={4}>Đơn giá</Col>
                <Col span={4} style={{ paddingLeft: '20px' }}>Số lượng</Col>
                <Col span={4} style={{ paddingLeft: '40px' }}>Số tiền</Col>
                <Col span={3} style={{ paddingLeft: '50px' }}>Thao tác</Col>
            </Row>

            {groupedItems.length === 0 && (
                <Text style={{ padding: 20, display: 'block' }}>Giỏ hàng trống</Text>
            )}

            {groupedItems.map(group => (
                <div key={group.sellerId} style={{ marginTop: 20 }}>
                    <Text strong style={{ fontSize: 16, marginBottom: 8, display: 'block' }}>
                        Người bán: {group.sellerName}
                    </Text>

                    {group.items.map(item => {
                        const isInvalid = !item?.productName;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    padding: '16px 0',
                                    borderBottom: '1px solid #f0f0f0',
                                }}
                            >
                                <Row align="middle" gutter={80}>
                                    <Col span={8}>
                                        <Row gutter={15} align="middle" wrap={false}>
                                            <Col>
                                                <Checkbox
                                                    checked={item.isSelected || false}
                                                    disabled={isInvalid}
                                                    onChange={(e) => handleToggleSelection(item.id, e.target.checked)}
                                                />
                                            </Col>
                                            <Col>
                                                <Image
                                                    width={70}
                                                    src={item?.thumbnail || '/fallback.jpg'}
                                                    fallback="/fallback.jpg"
                                                    style={{ borderRadius: 4 }}
                                                />
                                            </Col>
                                            <Col flex="auto">
                                                {isInvalid ? (
                                                    <Text type="danger" style={{ display: 'block' }}>
                                                        Sản phẩm không tồn tại hoặc đã bị xoá
                                                    </Text>
                                                ) : (
                                                    <Text strong ellipsis={{ tooltip: item?.productName }}>
                                                        {item?.productName}
                                                    </Text>
                                                )}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={4}>
                                        <Text>
                                            {isInvalid ? '--' : `${item.price.toLocaleString()}₫`}
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            min={1}
                                            max={item.stockQuantity}
                                            value={item.quantity}
                                            disabled={isInvalid}
                                            onChange={(value) => handleQuantityChange(item.id, value)}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Text>
                                            {isInvalid
                                                ? '--'
                                                : `${(item.price * item.quantity).toLocaleString()}₫`}
                                        </Text>
                                    </Col>
                                    <Col span={2}>
                                        <Button
                                            type="link"
                                            danger
                                            onClick={() => handleToggleSelection(item.id, false)}
                                            disabled={isInvalid}
                                        >
                                            Xóa
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        );
                    })}
                </div>
            ))}

            <Divider />

            <Row align="middle" justify="space-between">
                <Col>
                    <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={e => handleToggleAll(e.target.checked)}
                    >
                        Chọn tất cả ({allItems.length})
                    </Checkbox>

                    <Button
                        type="link"
                        danger
                        onClick={handleRemoveSelected}
                        disabled={!someSelected}
                    >
                        Xóa
                    </Button>

                    <Button type="link" onClick={() => {
                        // Xóa các sản phẩm không hoạt động: bạn có thể implement API hoặc filter ở đây
                        alert('Chức năng bỏ sản phẩm không hoạt động chưa có.');
                    }}>
                        Bỏ sản phẩm không hoạt động
                    </Button>
                </Col>

                <Col>
                    <Text strong>
                        Tổng cộng ({totalQuantity} sản phẩm):{' '}
                        <Text style={{ color: 'red' }}>
                            {totalPrice.toLocaleString()}₫
                        </Text>
                    </Text>
                    <Button
                        type="primary"
                        style={{ marginLeft: 16 }}
                        disabled={!someSelected}
                        onClick={() => alert('Chức năng mua hàng chưa được triển khai')}
                    >
                        Mua hàng
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;
