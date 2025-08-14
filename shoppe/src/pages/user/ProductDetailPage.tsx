import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Alert, Button, Input, Flex, Image, message } from 'antd';
import { getDetailProduct } from '../../api/product/product.api';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getTokenState } from '../../features/slices/app.slice';
import { createCartItem } from '../../api/cartitem/cartitem.api';
import { addItem } from '../../features/slices/cart.slice';
import { COLOR_DEFAULT } from '../../constants/Color';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);

    const token = useSelector(getTokenState);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res: any = await getDetailProduct(id!);
                if (res.success) {
                    setProduct(res.data);
                    if (res.data.productVariants.length > 0) {
                        setSelectedVariantId(res.data.productVariants[0].id);
                    }
                } else {
                    setError('Không tìm thấy sản phẩm');
                }
            } catch (e) {
                setError('Lỗi khi tải dữ liệu sản phẩm');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleAddToCart = async () => {
        if (!token) {
            navigate('/auth/login');
            return;
        }

        // Nếu sản phẩm có biến thể → phải chọn biến thể và số lượng hợp lệ
        const hasVariants = product?.productVariants?.length > 0;

        if (hasVariants && (!selectedVariantId || quantity <= 0)) {
            message.warning('Vui lòng chọn phân loại và số lượng hợp lệ');
            return;
        }

        if (!hasVariants && quantity <= 0) {
            message.warning('Vui lòng chọn số lượng hợp lệ');
            return;
        }

        try {
            const payload = {
                productId: product.id,
                productVariantId: hasVariants ? selectedVariantId : null,
                quantity,
            };

            await createCartItem(payload); // Gửi lên server

            // Tìm variant nếu có
            const selectedVariant = hasVariants
                ? product.productVariants.find((v: any) => v.id === selectedVariantId)
                : null;

            dispatch(addItem({
                id: hasVariants
                    ? `${product.id}-${selectedVariant?.id}`
                    : `${product.id}`,
                productId: product.id,
                productVariantId: selectedVariant?.id || null,
                quantity,
                price: selectedVariant?.price || product?.price || 0,
                productName: product.productName,
                thumbnail: selectedVariant?.imageUrl || product.thumbnail,
                sellerId: product.sellerId,     // Bắt buộc phải có
                sellerName: product.sellerName, // Bắt buộc phải có
            }));

            message.success('🛒 Sản phẩm đã được thêm vào giỏ hàng!');
        } catch (error: any) {
            console.error('Add to cart error:', error);
            message.error(error?.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        }
    };

    const selectedVariant = product?.productVariants.find((v: any) => v.id === selectedVariantId);
    const prices = product?.productVariants.map((v: any) => v.price) || [];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const handleChangeQuantity = (value: number) => {
        const stockLimit = selectedVariant?.stockQuantity ?? product?.stockQuantity ?? 1;

        if (value < 1) setQuantity(1);
        else if (value > stockLimit) setQuantity(stockLimit);
        else setQuantity(value);
    };


    const increaseQuantity = () => handleChangeQuantity(quantity + 1);
    const decreaseQuantity = () => handleChangeQuantity(quantity - 1);

    if (loading) return <Spin tip="Đang tải sản phẩm..." />;
    if (error) return <Alert message={error} type="error" />;

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 6 }}>
            <div style={{ display: 'flex', gap: 32 }}>
                <img
                    src={selectedVariant?.imageUrl || product.thumbnail}
                    alt={product.productName}
                    style={{
                        width: 400,
                        height: 400,
                        objectFit: 'cover',
                        border: '1px solid #eee',
                        borderRadius: 8,
                    }}
                />

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 500 }}>{product.productName}</h1>

                    <div style={{ fontSize: 26, fontWeight: 600, color: COLOR_DEFAULT, margin: '16px 0' }}>
                        {selectedVariant && selectedVariant.price !== undefined
                            ? `₫${selectedVariant.price.toLocaleString('vi-VN')}`
                            : product?.price !== undefined
                                ? `₫${product.price.toLocaleString('vi-VN')}`
                                : minPrice === maxPrice
                                    ? `₫${minPrice.toLocaleString('vi-VN')}`
                                    : `₫${minPrice.toLocaleString('vi-VN')} - ₫${maxPrice.toLocaleString('vi-VN')}`}
                    </div>


                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Phân loại hàng</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {product.productVariants.map((v: any) => (
                                <div
                                    key={v.id}
                                    onClick={() => {
                                        setSelectedVariantId(v.id);
                                        setQuantity(1);
                                    }}
                                    style={{
                                        border: selectedVariantId === v.id ? `2px solid ${COLOR_DEFAULT}` : '1px solid #ccc',
                                        borderRadius: 4,
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        background: selectedVariantId === v.id ? '#fff2ee' : '#fff',
                                        fontSize: 14,
                                    }}
                                >
                                    <Flex align='center' gap={5}>
                                        <Image style={{ width: '30px', height: '30px' }} src={v.imageUrl} />
                                        {v.color} - {v.size}
                                    </Flex>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedVariant && (
                        <div style={{ fontSize: 14, marginBottom: 16 }}>
                            <strong>Tồn kho:</strong> {selectedVariant.stockQuantity}
                        </div>
                    )}

                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Số lượng</div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                onClick={decreaseQuantity}
                                disabled={quantity <= 1}
                                style={{ borderRadius: '0px' }}
                            >
                                -
                            </Button>

                            <Input
                                value={quantity}
                                onChange={(e) => handleChangeQuantity(Number(e.target.value))}
                                style={{
                                    width: 40,
                                    height: 32,
                                    borderRadius: '0px',
                                    textAlign: 'center',
                                    color: COLOR_DEFAULT
                                }}
                            />

                            <Button
                                onClick={increaseQuantity}
                                disabled={quantity >= (selectedVariant?.stockQuantity ?? product?.stockQuantity ?? 1)}
                                style={{ borderRadius: '0px' }}
                            >
                                +
                            </Button>

                        </div>

                    </div>

                    <Flex gap={15}>
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            size="large"
                            style={{
                                backgroundColor: '#FFF5F1',
                                border: `1px solid ${COLOR_DEFAULT}`,
                                color: COLOR_DEFAULT,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                fontWeight: 500,
                                borderRadius: '0px',
                                padding: 25
                            }}
                            onClick={handleAddToCart}
                        >
                            Thêm Vào Giỏ Hàng
                        </Button>

                        <Button
                            type="primary"
                            size="large"
                            style={{
                                backgroundColor: COLOR_DEFAULT,
                                border: `1px solid ${COLOR_DEFAULT}`,
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                fontWeight: 500,
                                borderRadius: '0px',
                                padding: 25
                            }}
                        >
                            Mua ngay
                        </Button>
                    </Flex>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
