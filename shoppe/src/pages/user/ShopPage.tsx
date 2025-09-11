import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, Row, Col, Typography, Button, Divider, Spin, Pagination, Input, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getInfoShop } from "./../../api/product/product.api";
import LoadingDefault from "../../components/loading/LoadingDefault";

const { Title, Text } = Typography;

interface Product {
    id: number;
    productName: string;
    price: number;
    thumbnail: string;
}

interface ShopInfo {
    sellerId: string;
    sellerName: string;
    sellerAvatar?: string;
    followers: number;
    description?: string;
}

const ShopPage = () => {
    const { sellerId } = useParams();
    const [shop, setShop] = useState<ShopInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState("");

    const fetchShopWithProducts = async (page: number, key: string = "") => {
        if (!sellerId) return;

        try {
            setLoading(true);

            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: key,
            };

            const res: any = await getInfoShop(sellerId, body);

            if (res?.success) {
                const data = res.data;
                // Cập nhật thông tin shop
                setShop({
                    sellerId: data.sellerId,
                    sellerName: data.sellerName,
                    sellerAvatar: data.sellerAvatar,
                    followers: data.followers ?? 0,
                    description: data.description ?? "",
                });

                // Cập nhật sản phẩm
                setProducts(data.products || []);
                setTotal(res.totalRecord || 0);
                setCurrentPage(page);
            } else {
                message.error(res?.message || "Không thể lấy dữ liệu shop");
            }
        } catch (error) {
            console.error(error);
            message.error("Đã xảy ra lỗi khi tải dữ liệu shop");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopWithProducts(1, keyword);
    }, [sellerId]);

    if (loading) return <LoadingDefault />;

    return (
        <div style={{ background: "#f5f5f5", minHeight: "100vh", gap: '20px' }}>
            {/* Shop Header */}
            <Card
                hoverable
                style={{
                    width: '100%',
                    marginBottom: 20,
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = 'translateY(-4px)';
                    card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
            >
                <Row gutter={16} align="middle">
                    <Col>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: 350,
                                height: 120,
                                borderRadius: 16,
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundImage: shop?.sellerAvatar
                                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${shop.sellerAvatar})`
                                    : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            {/* Overlay blur mềm */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backdropFilter: 'blur(6px)',
                                    zIndex: 1,
                                }}
                            />

                            {/* Avatar */}
                            <div style={{ position: 'relative', zIndex: 2, marginLeft: 20 }}>
                                <Avatar
                                    size={70}
                                    src={shop?.sellerAvatar}
                                    icon={<UserOutlined />}
                                    style={{
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                        border: '3px solid #fff',
                                    }}
                                />
                            </div>

                            {/* Thông tin shop */}
                            <div
                                style={{
                                    position: 'relative',
                                    zIndex: 2,
                                    marginLeft: 20,
                                    color: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Title level={4} style={{ color: 'white', marginBottom: 4 }}>
                                    {shop?.sellerName}
                                </Title>
                                {/* <Text style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>
                                    {shop?.description}
                                </Text>
                                {/* Optional: Followers / Rating / Follow Button */}
                                {/* <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                                        {shop?.followers?.toLocaleString()} Followers
                                    </Text>
                                    <button
                                        style={{
                                            backgroundColor: '#ff424f',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 12,
                                            padding: '4px 12px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Follow
                                    </button>
                                </div> */}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>



            {/* Shop Products */}
            <Row gutter={[16, 16]}>
                {products.map((p) => (
                    <Col xs={12} sm={8} md={6} lg={3} key={p.id}>
                        <Card
                            hoverable
                            style={{
                                borderRadius: 12,
                                overflow: 'hidden',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                const card = e.currentTarget;
                                card.style.transform = 'translateY(-4px) scale(1.03)';
                            }}
                            onMouseLeave={(e) => {
                                const card = e.currentTarget;
                                card.style.transform = 'translateY(0) scale(1)';
                            }}
                            cover={
                                <div style={{ position: 'relative' }}>
                                    <img
                                        alt={p.productName}
                                        src={p.thumbnail}
                                        style={{
                                            width: '100%',
                                            height: 180,
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                    {/* Optional: Discount badge */}

                                </div>
                            }
                        >
                            <Title
                                level={5}
                                style={{
                                    marginBottom: 4,
                                    height: 40,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                title={p.productName} // hover show full name
                            >
                                {p.productName}
                            </Title>
                            <Text strong style={{ color: 'red', fontSize: 16 }}>
                                {p.price.toLocaleString('vi-VN')}₫
                            </Text>
                        </Card>
                    </Col>
                ))}
            </Row>


            {/* Pagination */}
            {total > pageSize && (
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={(page) => fetchShopWithProducts(page, keyword)}
                    style={{ textAlign: "center", marginTop: 20 }}
                />
            )}
        </div>
    );
};

export default ShopPage;
