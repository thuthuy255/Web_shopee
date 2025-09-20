import React, { useEffect, useState } from 'react';
import type { TableColumnsType } from 'antd';
import { Flex, message } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { deleteProduct, getAllProduct } from '../../../api/product/product.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';
import { debounce } from 'lodash';
import Search from 'antd/es/input/Search';

interface Product {
    id: string; // tương đương Id
    productName: string;
    description: string;
    price: number;
    stockQuantity: number;
    status: string;
    thumbnail: string;
    categoryName: string;
    sellerName: string;
    isActive: boolean;
    sellerStatus: boolean;
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
                    WebkitLineClamp: 2,      // 👈 giới hạn 2 dòng
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    maxWidth: 200,          // 👈 nên set chiều rộng cố định
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
        width: '10%'
    },
    // {
    //     title: 'Mô tả',
    //     dataIndex: 'description',
    //     key: 'description',
    //     ellipsis: true,
    //     align: 'center',
    // },
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `${price.toLocaleString()} ₫`,
        align: 'center',
        width: '9%'
    },
    {
        title: 'Tồn kho',
        dataIndex: 'stockQuantity',
        key: 'stockQuantity',
        width: '10%',
        align: 'center'
    },
    {
        title: 'Hoạt động',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value) => (value ? 'Hoạt động' : 'Hết hàng'),
        align: 'center',
        width: '15%',
    },
    {
        title: 'Trạng thái người bán',
        dataIndex: 'sellerStatus',
        key: 'sellerStatus',
        render: (value) => (value ? 'Hoạt động' : 'Ngưng bán '),
        align: 'center',
    },
    {
        title: 'Người bán',
        dataIndex: 'sellerName',
        key: 'sellerName',
        align: 'center',

    },
    {
        title: 'Ảnh',
        dataIndex: 'thumbnail',
        key: 'thumbnail',
        width: '10%',
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
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const handlePageChange = (page: number) => fetchProduct(page, keyword);

    const fetchProduct = async (page: number, key: string) => {
        try {
            setLoading(true);
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: key,
            };
            const res: any = await getAllProduct(body);
            if (res?.success) {
                setData(res?.data);
                setTotal(res?.totalRecord);
                setCurrentPage(page);
            } else {
                message.error('Không thể lấy danh sách sản phẩm');
            }
        } catch (error) {
            console.error(error);
            message.error('Đã xảy ra lỗi khi tải dữ liệu');
        }
        finally {
            setLoading(false);
        }
    };

    const debouncedFetch = debounce((value: string) => {
        fetchProduct(1, value); // luôn bắt đầu từ trang 1 khi search
    }, 500); // 500ms

    // Lắng nghe keyword thay đổi
    useEffect(() => {
        debouncedFetch(keyword);
        return () => debouncedFetch.cancel(); // hủy debounce khi unmount
    }, [keyword]);

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await deleteProduct(id);
            setData((prev) => prev.filter((item) => item.id !== id));
            message.success('Đã xoá sản phẩm');
        } catch (error) {
            console.error(error);
            message.error('Xoá sản phẩm thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Flex align='center' justify='space-between' style={{ marginBottom: 16 }}>
                <h2>Danh sách sản phẩm </h2>
                <Search
                    placeholder="Tìm kiếm theo tên, danh mục,..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ marginBottom: 16, width: 300 }}
                />
            </Flex>
            {loading ? (
                <LoadingDefault />
            ) : (
                <CustomTable<Product>
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    total={total}
                    // scrollY={window.innerHeight - 300}
                    onPageChange={handlePageChange}
                    // onAdd={handleAdd}
                    // onView={handleView}
                    onDelete={handleDelete}
                />)}
        </div>
    );
}
