import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../../../api/category/category.api';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

function CategoryButton() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage] = useState(1);
    const [pageSize] = useState(10);
    const navigate = useNavigate();

    const fetchCategory = async () => {
        setLoading(true);
        const body = {
            pageInfo: {
                page: currentPage,
                pageSize: pageSize,
            },
            keyWord: '',
            filter: {},
            sorts: {},
        };
        try {
            const res: any = await getAllCategories(body);
            if (res.success && Array.isArray(res.data)) {
                setData(res.data);
            } else {
                console.error('Không thể lấy danh sách category');
            }
        } catch (error) {
            console.error('Đã xảy ra lỗi khi tải dữ liệu', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/user/products?category=${categoryId}`);
    };

    return (
        <div
            style={{
                backgroundColor: '#fff',
                padding: '24px 16px',
                width: '100%'
            }}
        >
            <p>DANH MỤC </p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '24px 12px',
                    backgroundColor: '#fff',
                    width: '100%',
                }}
            >
                {loading ? (
                    <Spin />
                ) : (
                    data.slice(0, 16).map((category) => (
                        <div
                            key={category.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                padding: '20px'
                            }}
                            onClick={() => handleCategoryClick(category.id)}
                            onMouseEnter={(e) => {
                                const target = e.currentTarget;
                                target.style.transform = 'translateY(-4px)';
                                target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget;
                                target.style.transform = 'none';
                                target.style.boxShadow = 'none';
                            }}
                        >
                            {category.imageUrl && (
                                <div
                                    style={{
                                        width: 85,
                                        height: 85,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        marginBottom: 8,
                                    }}
                                >
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </div>
                            )}
                            <span
                                style={{
                                    textAlign: 'center',
                                    fontSize: 13,
                                    lineHeight: '16px',
                                    color: '#333',
                                }}
                            >
                                {category.name}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CategoryButton;
