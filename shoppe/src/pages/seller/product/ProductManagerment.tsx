import React, { useEffect, useState } from 'react';
import type { TableColumnsType } from 'antd';
import { message } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { deleteProduct, getAllProductOfSeller } from '../../../api/product/product.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';

interface Product {
    id: string;
    productName: string;
    description: string;
    price: number;
    stockQuantity: number;
    status: string;
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
    },
    {
        title: 'Danh mục',
        dataIndex: 'categoryName',
        key: 'categoryName',
    },
    {
        title: 'Mô tả sản phẩm',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
    },
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (price) => `${price.toLocaleString()} ₫`,
    },
    {
        title: 'Tồn kho',
        dataIndex: 'stockQuantity',
        key: 'stockQuantity',
    },
    {
        title: 'Hoạt động',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value) => (value ? 'Hoạt động' : 'Hết hàng')
    },
    {
        title: 'Trạng thái người bán',
        dataIndex: 'sellerStatus',
        key: 'sellerStatus',
        render: (value) => (value ? 'Hoạt động' : 'Ngưng bán ')
    },

    {
        title: 'Ảnh sản phẩm',
        dataIndex: 'thumbnail',
        key: 'thumbnail',
        render: (src) => <img src={src} alt="ảnh sản phẩm" width={50} height={50} />,
    },
    {
        title: 'Ảnh danh mục',
        dataIndex: 'categoryImageUrl',
        key: 'categoryImageUrl',
        render: (src) => <img src={src} alt="ảnh danh mục" width={50} height={50} />,
    },
];


export default function ProductManagement() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const fetchProduct = async (page: number) => {
        try {
            setLoading(true);
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: '',
            };
            const res: any = await getAllProductOfSeller(body);
            console.log("🚀 ~ fetchProduct ~ res:", res)
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct(currentPage);
    }, []);

    const handlePageChange = (page: number) => {
        fetchProduct(page);
    };

    const handleAdd = () => {
        navigate('/seller/products/create');
    };

    const handleView = (record: Product) => {
        navigate(`/seller/products/edit/${record.id}`);
    };

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
            <h2>Danh sách sản phẩm</h2>
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
