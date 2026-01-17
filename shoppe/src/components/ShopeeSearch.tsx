import { Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { memo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProduct } from '../api/product/product.api';
import { COLOR_DEFAULT } from '../constants/Color';

const ShopeeSearch = () => {
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const debounceRef = useRef<any>(null);

    /* ===================== SEARCH GLOBAL ===================== */
    useEffect(() => {
        if (!searchText.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res: any = await getAllProduct({
                    pageInfo: { page: 1, pageSize: 20 }, // chỉ cần cho dropdown
                    keyWord: searchText,
                });

                const activeProducts =
                    res?.data?.filter(
                        (p: any) => p.isActive !== false && p.sellerStatus !== false
                    ) || [];

                setResults(activeProducts);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [searchText]);

    return (
        <div
            style={{
                width: '60%',
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: COLOR_DEFAULT,
                position: 'relative',
            }}
        >
            <div style={{ width: '80%', position: 'relative' }}>
                {/* ===================== SEARCH INPUT ===================== */}
                <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    allowClear
                    suffix={<SearchOutlined />}
                    style={{
                        backgroundColor: 'white',
                        padding: '14px',
                        borderRadius: 10,
                        fontSize: 15,
                    }}
                />

                {/* ===================== DROPDOWN ===================== */}
                {searchText && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 52,
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            borderRadius: 8,
                            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                            maxHeight: 320,
                            overflowY: 'auto',
                            zIndex: 1000,
                        }}
                    >
                        {/* ===== Loading ===== */}
                        {loading && (
                            <div style={{ padding: 20, textAlign: 'center' }}>
                                <Spin />
                            </div>
                        )}

                        {/* ===== Result ===== */}
                        {!loading && results.length > 0 && (
                            results.map((prod) => (
                                <div
                                    key={prod.id}
                                    onClick={() => {
                                        navigate(`/user/products/${prod.id}`);
                                        setSearchText('');
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor = '#fafafa')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor = 'white')
                                    }
                                >
                                    {/* Thumbnail */}
                                    <img
                                        src={prod.thumbnail}
                                        alt={prod.productName}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            objectFit: 'cover',
                                            borderRadius: 6,
                                            border: '1px solid #eee',
                                            flexShrink: 0,
                                        }}
                                    />

                                    {/* Info */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: '#222',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: 260,
                                            }}
                                        >
                                            {prod.productName}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: '#d0021b',
                                                marginTop: 4,
                                            }}
                                        >
                                            ₫{prod.price.toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* ===== Empty ===== */}
                        {!loading && results.length === 0 && (
                            <div
                                style={{
                                    padding: 14,
                                    color: '#999',
                                    textAlign: 'center',
                                }}
                            >
                                Không tìm thấy sản phẩm
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ShopeeSearch);
