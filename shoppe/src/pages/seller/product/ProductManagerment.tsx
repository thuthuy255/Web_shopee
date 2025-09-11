import React, { useEffect, useState } from 'react';
import type { TableColumnsType } from 'antd';
import { Flex, message, Select } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { deleteProduct, getAllProductOfSeller } from '../../../api/product/product.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';
import { debounce } from 'lodash';
import Search from 'antd/es/input/Search';

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

const columns: TableColumnsType<Product> = [
    {
        title: 'Tên sản phẩm',
        dataIndex: 'productName',
        key: 'productName',
        align: 'center',
        render: (text: string) => (
            <div
                style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    maxWidth: 250,
                }}
            >
                {text}
            </div>
        ),
    },
    {
        title: 'Danh mục',
        dataIndex: 'categoryName',
        key: 'categoryName',
        align: 'center',
    },
    {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        align: 'center',
    },
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `${price.toLocaleString()} ₫`,
        align: 'center',
    },
    {
        title: 'Tồn kho',
        dataIndex: 'stockQuantity',
        key: 'stockQuantity',
        width: '7%',
        align: 'center'
    },
    {
        title: 'Hoạt động',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value) => (value ? 'Hoạt động' : 'Hết hàng'),
        align: 'center',
    },
    {
        title: 'Trạng thái người bán',
        dataIndex: 'sellerStatus',
        key: 'sellerStatus',
        render: (value) => (value ? 'Hoạt động' : 'Ngưng bán'),
        align: 'center',
    },
    {
        title: 'Ảnh',
        dataIndex: 'thumbnail',
        key: 'thumbnail',
        width: '5%',
        align: 'center',
        render: (src: string) =>
            src ? (
                <img
                    src={src}
                    alt="ảnh sản phẩm"
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ) : (
                <p>Không có ảnh</p>
            ),
    }
];

export default function ProductManagement() {
    const [data, setData] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [filterIsActive, setFilterIsActive] = useState<string | null>(null);
    const [filterSellerStatus, setFilterSellerStatus] = useState<string | null>(null);

    const navigate = useNavigate();

    const fetchProduct = async (page: number, key: string) => {
        try {
            setLoading(true);
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: key,
                isActive: filterIsActive,         // gửi filter xuống backend
                sellerStatus: filterSellerStatus, // gửi filter xuống backend
            };
            const res: any = await getAllProductOfSeller(body);
            if (res?.success) {
                setData(res?.data);
                setTotal(res?.totalRecord); // lấy tổng từ API
                setCurrentPage(page);
            } else {
                message.error('Không thể lấy danh sách sản phẩm');
            }
        } catch (error) {
            console.error(error);
            message.error('Đã xảy ra lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = debounce((value: string) => {
        fetchProduct(1, value);
    }, 500);
    useEffect(() => {
        debouncedFetch(keyword);
        return () => debouncedFetch.cancel(); // hủy debounce khi unmount
    }, [keyword]);
    const debouncedKeywordChange = debounce((value: string) => {
        setKeyword(value);
        setCurrentPage(1); // reset to page 1
    }, 500);
    useEffect(() => {
        fetchProduct(currentPage, keyword);
    }, [currentPage, keyword, filterIsActive, filterSellerStatus]);
    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleAdd = () => navigate('/seller/products/create');
    const handleView = (record: Product) => navigate(`/seller/products/edit/${record.id}`);
    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await deleteProduct(id);
            setData(prev => prev.filter(item => item.id !== id));
            message.success('Đã xoá sản phẩm');
        } catch (error) {
            console.error(error);
            message.error('Xoá sản phẩm thất bại');
        } finally {
            setLoading(false);
        }
    };
    const filteredData = data
        .filter(item =>
            filterIsActive === null || item.isActive.toString() === filterIsActive
        )
        .filter(item =>
            filterSellerStatus === null || item.sellerStatus.toString() === filterSellerStatus
        );

    return (
        <div>
            <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
                <h2>Danh sách sản phẩm</h2>
                <Flex align="center" justify="space-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
                    <Search
                        placeholder="Tìm kiếm theo tên, danh mục..."
                        onChange={(e) => debouncedKeywordChange(e.target.value)}
                        style={{ minWidth: 200, flex: 1, maxWidth: 300 }}
                    />

                    <Flex gap={16} wrap="wrap">
                        <Select
                            placeholder="Trạng thái hoạt động"
                            allowClear
                            style={{ minWidth: 150 }}
                            value={filterIsActive}
                            onChange={(val) => setFilterIsActive(val)}
                        >
                            <Select.Option value="true">Hoạt động</Select.Option>
                            <Select.Option value="false">Hết hàng</Select.Option>
                        </Select>

                        <Select
                            placeholder="Trạng thái người bán"
                            allowClear
                            style={{ minWidth: 150 }}
                            value={filterSellerStatus}
                            onChange={(val) => setFilterSellerStatus(val)}
                        >
                            <Select.Option value="true">Hoạt động</Select.Option>
                            <Select.Option value="false">Ngưng bán</Select.Option>
                        </Select>
                    </Flex>
                </Flex>

            </Flex>



            {loading ? (
                <LoadingDefault />
            ) : (
                <CustomTable<Product>
                    rowKey="id"
                    columns={columns}
                    dataSource={data}              // dùng data trả từ server
                    pageSize={pageSize}
                    currentPage={currentPage}
                    total={total}                  // dùng total từ server
                    scrollY={window.innerHeight - 300}
                    onPageChange={handlePageChange}
                    onAdd={handleAdd}
                    onView={handleView}
                    onDelete={handleDelete}
                />

            )}
        </div>
    );
}
