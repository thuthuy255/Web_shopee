import React, { useEffect, useState } from 'react';
import { getAllProduct } from '../../../api/product/product.api';
import '../../../css/ProductCard.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setProductList } from '../../../features/slices/product.slice';

function ProductRecommended() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res: any = await getAllProduct({
                    pageInfo: { page: 1, pageSize: 10 },
                    keyWord: '',
                });

                if (res.success && Array.isArray(res.data)) {
                    // ✅ Lọc sản phẩm
                    const filtered = res.data.filter(
                        (p: any) => p.isActive !== false && p.sellerStatus !== false
                    );

                    setData(filtered);
                    dispatch(setProductList(filtered));
                } else {
                    console.error('Lấy sản phẩm thất bại');
                }
            } catch (e) {
                console.error('Lỗi tải dữ liệu', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '16px',
                width: '100%',
                marginTop: '10px',
            }}

        >
            {data && data.length > 0 ? (
                data.map((p, i) => {
                    const prices = (p.variants || []).map((v: any) => v.price);
                    const minPrice = prices.length > 0 ? Math.min(...prices) : p.price;
                    const maxPrice = prices.length > 0 ? Math.max(...prices) : p.price;

                    return (
                        <div key={i} className="product-card" onClick={() => navigate(`/user/products/${p.id}`)}>
                            <div style={{ position: 'relative', padding: 8 }}>
                                <img
                                    src={p.thumbnail}
                                    alt={p.productName}
                                    style={{
                                        width: '100%',
                                        height: 200,
                                        objectFit: 'cover',
                                        borderRadius: 4,
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    padding: '0 8px 8px 8px',
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <div className="product-name">{p.productName}</div>

                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <div className="product-price">
                                        {minPrice === maxPrice
                                            ? `₫${minPrice.toLocaleString('vi-VN')}`
                                            : `₫${minPrice.toLocaleString('vi-VN')} - ₫${maxPrice.toLocaleString('vi-VN')}`}
                                    </div>

                                    {p.oldPrice && (
                                        <div className="product-old-price">
                                            ₫{p.oldPrice.toLocaleString('vi-VN')}
                                        </div>
                                    )}
                                </div>

                                {p.discountText && (
                                    <div className="product-discount">{p.discountText}</div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                !loading && (
                    <div className="col-span-full text-center text-gray-500">
                        Không có sản phẩm đề xuất
                    </div>
                )
            )}
        </div>
    );
}

export default ProductRecommended;
