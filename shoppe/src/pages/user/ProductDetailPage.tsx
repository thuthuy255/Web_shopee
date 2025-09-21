// pages/product/ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Alert, Button, Input, Image, message, Typography, Divider } from 'antd';
import { ShopFilled, ShoppingCartOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getDetailProduct } from '../../api/product/product.api';
import { createCartItem } from '../../api/cartitem/cartitem.api';
import { getTokenState } from '../../features/slices/app.slice';
import { COLOR_DEFAULT } from '../../constants/Color';
import InfoRowDetail from './components/InfoRowDetail';
import { setCart } from '../../features/slices/cart.slice';
import { showSuccess } from '../../untils/ShowToast';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const token = useSelector(getTokenState);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Fetch chi tiết sản phẩm
    const fetchProductDetail = async (productId: string) => {
        setLoading(true);
        try {
            const res: any = await getDetailProduct(productId);
            console.log("🚀 ~ fetchProductDetail ~ res:", res)
            if (res?.success) {
                setProduct(res?.data);
                if (res?.data?.productVariants?.length) {
                    setSelectedVariantId(res.data.productVariants[0].id);
                }
            } else {
                setError('Không tìm thấy sản phẩm');
            }
        } catch {
            setError('Lỗi khi tải dữ liệu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProductDetail(id);
    }, [id]);

    const selectedVariant = product?.productVariants?.find((v: any) => v.id === selectedVariantId);

    // Số lượng
    const handleChangeQuantity = (value: number) => {
        const stockLimit = selectedVariant?.stockQuantity ?? product?.stockQuantity ?? 1;
        setQuantity(Math.max(1, Math.min(value, stockLimit)));
    };
    const increaseQuantity = () => handleChangeQuantity(quantity + 1);
    const decreaseQuantity = () => handleChangeQuantity(quantity - 1);

    // Thêm vào giỏ hàng
    const handleAddToCart = async () => {
        if (!token) return navigate('/auth/login');

        const hasVariants = !!product?.productVariants?.length;
        if ((hasVariants && !selectedVariantId) || quantity <= 0) {
            message.warning('Vui lòng chọn phân loại và số lượng hợp lệ');
            return;
        }

        try {
            const variant = hasVariants
                ? product.productVariants.find((v: any) => v.id === selectedVariantId)
                : null;

            const payload = {
                productId: product.id,
                productName: product.productName,
                sellerName: product.sellerName,
                thumbnail: product.thumbnail,
                categoryName: product.categoryName,
                productVariantId: variant ? variant.id : null,
                variantName: variant ? `${variant.color} - ${variant.size}` : null,
                variantPrice: variant ? variant.price : product.price,
                variantImage: variant ? variant.imageUrl : null,
                stockQuantity: variant ? variant.stockQuantity : product.stockQuantity,
                price: variant ? variant.price : product.price,
                quantity,
            };

            const res: any = await createCartItem(payload);
            if (res.success) {
                dispatch(setCart(res));
                showSuccess('🛒 Đã thêm vào giỏ hàng!');
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        }
    };

    // Mua ngay (chuyển sang checkout)
    const handleBuyNow = () => {
        if (!token) {
            navigate('/auth/login');
            return;
        }

        const hasVariants = !!product?.productVariants?.length;
        if ((hasVariants && !selectedVariantId) || quantity <= 0) {
            message.warning('Vui lòng chọn phân loại và số lượng hợp lệ');
            return;
        }

        const variant = hasVariants
            ? product.productVariants.find((v: any) => v.id === selectedVariantId)
            : null;

        const selectedItem = {
            id: product.id,
            productId: product.id,
            productName: product.productName,
            sellerName: product.sellerName,
            thumbnail: product.thumbnail,
            // price: product.price,
            categoryName: product.categoryName,
            productVariantId: variant ? variant.id : null,
            variantName: variant ? `${variant.color} - ${variant.size}` : null,
            variantPrice: variant ? variant.price : product.price,
            variantImage: variant ? variant.imageUrl : null,
            stockQuantity: variant ? variant.stockQuantity : product.stockQuantity,
            price: variant ? variant.price : product.price,
            quantity,

        };

        navigate('/user/checkout', { state: { items: [selectedItem] } });
    };

    if (loading) return <Spin tip="Đang tải sản phẩm..." />;
    if (error) return <Alert message={error} type="error" />;

    return (
        <div>
            {/* ===== Thông tin sản phẩm ===== */}
            <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 6 }}>
                <div style={{ display: 'flex', gap: 32 }}>
                    <img
                        src={selectedVariant?.imageUrl || product.thumbnail}
                        alt={product.productName}
                        style={{ width: 400, height: 400, objectFit: 'cover', border: '1px solid #eee', borderRadius: 8 }}
                    />
                    <div style={{ flex: 1 }}>
                        <Title level={3} style={{ marginBottom: 8 }}>{product.productName}</Title>

                        <div style={{ fontSize: 26, fontWeight: 600, color: COLOR_DEFAULT, margin: '12px 0 20px' }}>
                            {(selectedVariant?.price ?? product?.price)?.toLocaleString('vi-VN')}đ
                        </div>

                        {/* Phân loại */}
                        {product?.productVariants?.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Phân loại hàng</div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <Image
                                                style={{ width: 30, height: 30, objectFit: 'cover' }}
                                                src={v.imageUrl}
                                            />
                                            {v.variantValue}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Số lượng */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Số lượng</div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Button.Group>
                                    <Button onClick={decreaseQuantity} disabled={quantity <= 1} >-</Button>
                                    <Input
                                        value={quantity}
                                        onChange={(e) => handleChangeQuantity(Number(e.target.value))}
                                        style={{ width: 40, height: 32, textAlign: 'center' }}
                                    />
                                    <Button
                                        onClick={increaseQuantity}
                                        disabled={quantity >= (selectedVariant?.stockQuantity ?? product?.stockQuantity ?? 1)}
                                    >
                                        +
                                    </Button>
                                </Button.Group>
                            </div>

                        </div>

                        {/* Nút Thêm vào giỏ & Mua ngay */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                size="large"
                                style={{
                                    backgroundColor: '#FFF5F1',
                                    border: `1px solid ${COLOR_DEFAULT}`,
                                    color: COLOR_DEFAULT,
                                    fontWeight: 500,
                                    borderRadius: 0,
                                    padding: '18px 26px',
                                }}
                                onClick={handleAddToCart}
                            >
                                Thêm vào giỏ hàng
                            </Button>

                            <Button
                                type="primary"
                                size="large"
                                style={{
                                    backgroundColor: COLOR_DEFAULT,
                                    border: `1px solid ${COLOR_DEFAULT}`,
                                    color: '#fff',
                                    fontWeight: 500,
                                    borderRadius: 0,
                                    padding: '18px 26px',
                                }}
                                onClick={handleBuyNow}
                            >
                                Mua ngay
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Thông tin shop ===== */}
            <div style={{ padding: 24, maxWidth: 1200, margin: '20px auto', background: '#fff', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <Image
                            src={product?.thumbnail}
                            alt={product?.productName}
                            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text style={{ fontSize: 18, fontWeight: 600 }}>{product?.productName}</Text>
                            <Text type="secondary">Người bán uy tín</Text>
                        </div>
                    </div>
                    <Button
                        type="default"
                        onClick={() => navigate(`/user/shop/${product?.sellerId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 500, borderRadius: 8, padding: '6px 16px' }}
                    >
                        <ShopFilled style={{ color: '#ff4d4f', fontSize: 16 }} />
                        <span>Xem shop</span>
                    </Button>
                </div>
            </div>

            {/* ===== Chi tiết sản phẩm ===== */}
            <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', background: '#fff', borderRadius: 6 }}>
                <Title level={5} style={{ margin: 0, paddingBottom: 12 }}>CHI TIẾT SẢN PHẨM</Title>
                <Divider style={{ margin: '12px 0' }} />
                <InfoRowDetail label="Danh Mục" value={<span>{product?.sellerName} &gt; {product?.categoryName} &gt; {product?.productName}</span>} />
                <InfoRowDetail label="Kho" value={product.stockQuantity > 0 ? 'CÒN HÀNG' : 'HẾT HÀNG'} />
                <InfoRowDetail label="Trạng thái" value={product.status?.toUpperCase()} />
                <InfoRowDetail label="Phân loại" value={product.productVariants?.length ? `${product.productVariants.length} biến thể` : 'Không có'} />
                <InfoRowDetail label="Giá niêm yết" value={`${(product.price)?.toLocaleString('vi-VN')}₫`} />
            </div>

            <div style={{ padding: 24, maxWidth: 1200, margin: '20px auto', background: '#fff', borderRadius: 6 }}>
                <Title level={5} style={{ margin: 0, paddingBottom: 12 }}>MÔ TẢ SẢN PHẨM</Title>
                <Divider style={{ margin: '12px 0' }} />
                {product?.description ? (
                    <Paragraph style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                        {product.description}
                    </Paragraph>
                ) : (
                    <Text type="secondary">Chưa có mô tả cho sản phẩm này.</Text>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
