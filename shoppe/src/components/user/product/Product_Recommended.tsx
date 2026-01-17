import React, { useEffect, useState } from 'react';
import { Pagination, Spin, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { getAllProduct } from '../../../api/product/product.api';
import { setProductList } from '../../../features/slices/product.slice';
import '../../../css/ProductCard.css';

const { Search } = Input;

/* ===================== COMPONENT ===================== */
function ProductRecommended() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    /* ===================== STATE ===================== */
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [total, setTotal] = useState(0);

    const [keyword, setKeyword] = useState('');

    /* ===================== FETCH PRODUCTS ===================== */
    const fetchProducts = async (page: number, searchKey = keyword) => {
        setLoading(true);
        try {
            const res: any = await getAllProduct({
                pageInfo: { page, pageSize },
                keyWord: searchKey,
            });

            if (!res?.success || !Array.isArray(res.data)) {
                console.error('Lấy danh sách sản phẩm thất bại');
                return;
            }

            // ✅ Backend đã search, frontend chỉ lọc trạng thái
            const activeProducts = res.data.filter(
                (p: any) => p.isActive !== false && p.sellerStatus !== false
            );

            setProducts(activeProducts);
            setTotal(res.totalRecord || 0);
            // dispatch(setProductList(activeProducts));
        } catch (error) {
            console.error('Lỗi tải dữ liệu sản phẩm', error);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== EFFECT ===================== */
    useEffect(() => {
        fetchProducts(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, keyword]);

    /* ===================== HANDLERS ===================== */
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (value: string) => {
        setKeyword(value);
        setCurrentPage(1); // 🔥 search là phải quay về page 1
    };

    /* ===================== RENDER ===================== */
    return (
        <div style={{ width: '100%' }}>
            {/* ===== Search ===== */}
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm kiếm sản phẩm..."
                    allowClear
                    enterButton
                    onSearch={handleSearch}
                />
            </div>

            {/* ===== Loading ===== */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* ===== Product Grid ===== */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: 16,
                            margin: '20px 0',
                        }}
                    >
                        {products.length > 0 ? (
                            products.map((product, index) => {
                                const prices =
                                    product.variants?.map((v: any) => v.price) || [];

                                const minPrice =
                                    prices.length > 0
                                        ? Math.min(...prices)
                                        : product.price;

                                const maxPrice =
                                    prices.length > 0
                                        ? Math.max(...prices)
                                        : product.price;

                                return (
                                    <div
                                        key={product.id || index}
                                        className="product-card"
                                        onClick={() =>
                                            navigate(`/user/products/${product.id}`)
                                        }
                                    >
                                        {/* Thumbnail */}
                                        <div style={{ padding: 8 }}>
                                            <img
                                                src={product.thumbnail}
                                                alt={product.productName}
                                                style={{
                                                    width: '100%',
                                                    height: 200,
                                                    objectFit: 'cover',
                                                    borderRadius: 4,
                                                }}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div
                                            style={{
                                                padding: '0 8px 8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flexGrow: 1,
                                            }}
                                        >
                                            <div className="product-name">
                                                {product.productName}
                                            </div>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <div className="product-price">
                                                    {minPrice === maxPrice
                                                        ? `₫${minPrice.toLocaleString('vi-VN')}`
                                                        : `₫${minPrice.toLocaleString(
                                                            'vi-VN'
                                                        )} - ₫${maxPrice.toLocaleString('vi-VN')}`}
                                                </div>

                                                {product.oldPrice && (
                                                    <div className="product-old-price">
                                                        ₫
                                                        {product.oldPrice.toLocaleString(
                                                            'vi-VN'
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {product.discountText && (
                                                <div className="product-discount">
                                                    {product.discountText}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', color: '#999' }}>
                                Không có sản phẩm
                            </div>
                        )}
                    </div>

                    {/* ===== Pagination ===== */}
                    {total > pageSize && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                margin: '24px 0',
                            }}
                        >
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={total}
                                showSizeChanger={false}
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} của ${total} sản phẩm`
                                }
                                onChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ProductRecommended;
