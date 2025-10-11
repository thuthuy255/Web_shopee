import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Card, Row, Col, Empty, Button } from 'antd';
import { getProductsByCategory } from '../../api/product/product.api';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Meta } = Card;

function ProductsPage() {
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fetchProducts = async () => {
        if (!categoryId) return;
        setLoading(true);
        try {
            const body = {
                pageInfo: {
                    page: 1,
                    pageSize: 20,
                },
                keyWord: '',
                filter: {},
                sorts: {},
            };

            const res: any = await getProductsByCategory(categoryId, body);
            if (res?.success && Array.isArray(res.data)) {
                setProducts(res.data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProducts();
    }, [categoryId]);

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10, marginLeft: '-2px' }}>
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
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
            </div>
            <h2>Danh sách sản phẩm</h2>
            {loading ? (
                <Spin />
            ) : products.length === 0 ? (
                <Empty description="Không có sản phẩm nào trong danh mục này" />
            ) : (
                <Row gutter={[16, 16]}>
                    {products.map((product) => (
                        <Col xs={12} sm={8} md={8} lg={4} key={product.id}>
                            <Card
                                hoverable
                                cover={
                                    <img
                                        alt={product.name}
                                        src={product.thumbnail || '/no-image.png'}
                                        style={{ height: 200, objectFit: "contain" }}
                                    />
                                }
                                onClick={() => {
                                    // Điều hướng sang trang chi tiết sản phẩm nếu cần
                                    navigate(`/user/products/${product.id}`)
                                }}
                            >
                                <Meta
                                    title={
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 14,
                                                color: "#111",
                                                lineHeight: "20px",
                                                overflow: "hidden",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2, // giới hạn 2 dòng
                                                WebkitBoxOrient: "vertical",
                                            }}
                                        >
                                            {product.productName}
                                        </div>
                                    }
                                    description={
                                        <div
                                            style={{
                                                marginTop: 6,
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: "#d0011b", // đỏ kiểu shopee
                                            }}
                                        >
                                            {product.price.toLocaleString()} đ
                                        </div>
                                    }
                                />

                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}

export default ProductsPage;
