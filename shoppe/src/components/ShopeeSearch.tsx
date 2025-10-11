import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { memo, useEffect, useMemo, useState } from 'react';
import { getAllCategories } from '../api/category/category.api';
import { showError } from '../untils/ShowToast';
import { COLOR_DEFAULT } from '../constants/Color';
import { InfoProductState } from '../features/slices/product.slice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    parentCategoryId?: string | null;
}

interface Product {
    id: string;
    productName: string;
    description: string;
    price: number;
    stockQuantity: number;
    thumbnail: string;
    isActive: boolean;
    sellerStatus: boolean;
    categoryId: string;
    categoryName: string;
    categoryDescription: string;
    categoryImageUrl: string;
}

const ShopeeSearch = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    const { products } = useSelector(InfoProductState);

    // fetch categories
    const fetchCategory = async (page: number) => {
        try {
            const body = { pageInfo: { page, pageSize }, keyWord: '' };
            const res = await getAllCategories(body);
            if (res?.data) {
                setCategories(res?.data);
                setCurrentPage(page);
            } else {
                showError('Không thể lấy danh sách danh mục');
            }
        } catch (error) {
            console.error(error);
            showError('Đã xảy ra lỗi khi tải dữ liệu');
        }
    };

    useEffect(() => {
        fetchCategory(currentPage);
    }, []);

    // filter products theo searchText
    const filteredProducts = useMemo(() => {
        if (!searchText) return [];
        return products.filter((product: Product) =>
            product?.productName.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, products]);

    return (
        <div style={{ width: '60%', display: 'flex', justifyContent: 'center', backgroundColor: COLOR_DEFAULT, position: 'relative' }}>
            <div style={{ width: '80%' }}>
                {/* Search box */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '50px',
                        border: `2px solid ${COLOR_DEFAULT}`,
                        borderRadius: 4,
                        overflow: 'hidden',

                        padding: '5px',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        allowClear
                        suffix={<SearchOutlined />}
                        style={{ backgroundColor: 'white', padding: "15px", borderRadius: '10px' }}
                    />
                </div>

                {/* Dropdown hiển thị sản phẩm khi searchText không rỗng */}
                {searchText && filteredProducts.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '55px',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        maxHeight: 300,
                        overflowY: 'auto',
                        zIndex: 10
                    }}>
                        {filteredProducts.map((prod: any) => (
                            <div
                                key={prod.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '8px 12px',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onClick={() => {
                                    navigate(`/user/products/${prod.id}`);
                                    setSearchText(""); // ✅ reset search để ẩn dropdown
                                    // setFilteredProducts([]); // ✅ (tuỳ chọn) xóa danh sách kết quả
                                }}

                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                            >
                                {/* Thumbnail */}
                                <img
                                    src={prod.thumbnail || 'https://via.placeholder.com/60'}
                                    alt={prod.productName}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        flexShrink: 0,
                                        border: '1px solid #eee',
                                    }}
                                />

                                {/* Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: '#333',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {prod.productName}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#d0021b',
                                            marginTop: 4,
                                        }}
                                    >
                                        {prod.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                    </div>
                )}

                {/* Category list */}
                <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {categories.map((cat) => (
                        <a
                            key={cat.id}
                            href="#"
                            title={cat.name}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                backgroundColor: COLOR_DEFAULT,
                                padding: '2px 6px',
                                borderRadius: 4,
                                marginRight: 8,
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {cat.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default memo(ShopeeSearch);
