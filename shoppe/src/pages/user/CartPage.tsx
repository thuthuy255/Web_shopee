import React, { useEffect } from 'react';
import {
    Checkbox,
    Button,
    InputNumber,
    Image,
    Typography,
    Divider,
    Row,
    Col,
    Flex,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getUserCartItems } from '../../api/cartitem/cartitem.api';
import { setCartItems } from '../../features/slices/cart.slice';
import type { RootState } from '../../features/store';

const { Text } = Typography;

const CartPage = () => {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.app.token);
    const cartItems = useSelector((state: RootState) => state.cart.items);

    useEffect(() => {
        if (token) {
            fetchCart();
        }
    }, [token]);

    const fetchCart = async () => {
        try {
            const res = await getUserCartItems();
            console.log('🚀 ~ fetchCart ~ res:', res);
            dispatch(setCartItems(res.data));
        } catch (err) {
            console.error(err);
        }
    };

    // Lọc ra các sản phẩm có dữ liệu hợp lệ
    const validCartItems = cartItems.filter((item) => item.product);

    const totalQuantity = validCartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );
    const totalPrice = validCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div style={{ padding: 20 }}>
            <Row
                gutter={16}
                style={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ddd',
                    paddingBottom: 10,
                }}
            >
                <Col>
                    <Checkbox />
                </Col>
                <Col span={8}>Sản phẩm</Col>
                <Col span={4}>Đơn giá</Col>
                <Col span={4}>Số lượng</Col>
                <Col span={4}>Số tiền</Col>
                <Col span={2}>Thao tác</Col>
            </Row>

            {cartItems.map((item: any) => {
                const isInvalid = !item.productName;

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
                                    {/* Checkbox */}
                                    <Col>
                                        <Checkbox disabled={isInvalid} />
                                    </Col>

                                    {/* Ảnh sản phẩm */}
                                    <Col >
                                        <Image
                                            width={70}
                                            src={item?.thumbnail || '/fallback.jpg'}
                                            fallback="/fallback.jpg"
                                            style={{ borderRadius: 4 }}
                                        />
                                    </Col>

                                    {/* Tên sản phẩm */}
                                    <Col flex="auto">
                                        {isInvalid ? (
                                            <Text type="danger" style={{ display: 'block' }}>
                                                Sản phẩm không tồn tại hoặc đã bị xoá
                                            </Text>
                                        ) : (
                                            <Text
                                                strong
                                                ellipsis={{ tooltip: item?.productName }}
                                                style={{
                                                    display: 'block',
                                                    maxWidth: '100%',
                                                    lineHeight: '1.4',
                                                }}
                                            >
                                                {item?.productName}
                                            </Text>
                                        )}
                                    </Col>
                                </Row>
                            </Col>

                            <Col span={4}>
                                <Text>
                                    {isInvalid
                                        ? '--'
                                        : `${item.price.toLocaleString()}₫`}
                                </Text>
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    min={1}
                                    value={item.quantity}
                                    disabled={isInvalid}
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
                                <Button type="link" danger style={{ textAlign: 'center' }}>
                                    Xóa
                                </Button>
                                <br />
                                {/* {!isInvalid && (
                                    <Button type="link">Tìm sản phẩm tương tự</Button>
                                )} */}
                            </Col>
                        </Row>
                    </div>
                );
            })}

            <Divider />

            <Row align="middle" justify={'space-between'}>
                <Col>
                    <Checkbox>Chọn tất cả ({validCartItems.length})</Checkbox>
                    <Button type="link" danger>
                        Xóa
                    </Button>
                    <Button type="link">Bỏ sản phẩm không hoạt động</Button>
                </Col>
                <Col>
                    <Text strong>
                        Tổng cộng ({totalQuantity} sản phẩm):{' '}
                        <Text style={{ color: 'red' }}>
                            {totalPrice.toLocaleString()}₫
                        </Text>
                    </Text>
                    <Button type="primary" style={{ marginLeft: 16 }}>
                        Mua hàng
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;
