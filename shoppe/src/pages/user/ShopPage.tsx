import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Avatar, Row, Col, Typography, Pagination, message } from "antd";
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
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(15);
    const [keyword] = useState("");
    const [total, setTotal] = useState(0);

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

                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>



            {/* Shop Products */}
            <Row gutter={[16, 20]} justify="start">
                {products.map((p) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={p.id}>
                        <Card
                            hoverable
                            style={{
                                borderRadius: 12,
                                overflow: 'hidden',
                                transition: 'transform 0.2s ease',
                                height: '100%',

                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            cover={
                                <div style={{ position: 'relative' }} onClick={() => navigate(`/user/products/${p.id}`)}>
                                    <img
                                        alt={p.productName}
                                        src={p.thumbnail}
                                        style={{
                                            width: '100%',
                                            height: 240,
                                            objectFit: 'cover',
                                            display: 'block',
                                            borderBottom: '1px solid #f0f0f0',
                                        }}
                                    />
                                </div>
                            }
                        >
                            <Title
                                level={5}
                                style={{
                                    marginBottom: 6,
                                    height: 44,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                title={p.productName}
                            >
                                {p.productName}
                            </Title>
                            <Text strong style={{ color: '#d0021b', fontSize: 18 }}>
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
