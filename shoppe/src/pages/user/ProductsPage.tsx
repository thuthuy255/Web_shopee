import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Card, Row, Col, Empty, Button, Flex } from 'antd';
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
                    onClick={() => navigate('/user')}
                >
                    Quay lại
                </Button>
            </div>
            {/* <h2>Danh sách sản phẩm</h2> */}
            {loading ? (
                <Spin />
            ) : products.length === 0 ? (
                <Empty description="Không có sản phẩm nào trong danh mục này" />
            ) : (

                <>
                    {products.length > 0 && (
                        <Flex style={{ marginBottom: 16 }} justify="center" >
                            <p style={{ fontSize: 30, fontWeight: 600 }}>
                                Danh sách sản phẩm của {products[0]?.categoryName}
                            </p>
                        </Flex>
                    )}

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
                                    onClick={() => navigate(`/user/products/${product.id}`)}
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
                                                    WebkitLineClamp: 2,
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
                                                    color: "#d0011b",
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
                </>

            )}
        </div>
    );
}

export default ProductsPage;
