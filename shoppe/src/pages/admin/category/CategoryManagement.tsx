import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import type { TableColumnsType } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { deleteSeller, getAllSeller } from '../../../api/seller/seller.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { deleteCategory, getAllCategories } from '../../../api/category/category.api';

interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    parentCategoryId?: string | null;
}


const columns: TableColumnsType<Category> = [
    {
        title: 'Tên danh mục',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
    },
    {
        title: 'Ảnh',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        render: (url) => (
            <img src={url} alt="category" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
        ),
    },
    {
        title: 'Thuộc danh mục',
        dataIndex: 'parentCategoryId',
        key: 'parentCategoryId',
        render: (value) => value ? value : 'Không có',
    },
];


export default function CategoryManagement() {
    const [data, setData] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const fetchCategory = async (page: number) => {
        try {
            const body = {
                pageInfo: {
                    page: page,
                    pageSize: pageSize,
                },
                keyWord: '',
                filter: {},
                sorts: {},
            };
            const res = await getAllCategories(body);
            if (res.data) {
                setData(res.data);
                setTotal(res.data?.totalRecord || (res.data?.length ?? 0));
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

    const handlePageChange = (page: number) => {
        fetchCategory(page);
    };
    const handleAdd = () => {
        navigate('/admin/category/create');
    };

    const handleView = (record: Category) => {
        navigate(`/admin/seller/edit/${record.id}`);
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true); // ✅ loading bắt đầu
            await deleteCategory(id);
            setData((prev) => prev.filter((item) => item.id !== id));
            showSuccess('Đã xoá danh mục');
        } catch (error) {
            console.error(error);
            showError('Xoá danh mục thất bại');
        } finally {
            setLoading(false); // ✅ loading kết thúc
        }
    };



    return (
        <div>
            <h2>Danh sách người bán</h2>
            <CustomTable<Category>
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
        </div>
    );
}
