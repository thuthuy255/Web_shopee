import { useEffect, useState } from 'react';
import type { TableColumnsType } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { deleteCategory, getAllCategories } from '../../../api/category/category.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';

interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    parentCategoryId?: string | null;
    sellerName: string;
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
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const fetchCategory = async (page: number) => {
        setLoading(true);
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
            const res: any = await getAllCategories(body);
            if (res?.success) {
                setData(res?.data);
                setTotal(res?.totalRecord);
                setCurrentPage(page);
            } else {
                showError('Không thể lấy danh sách danh mục');
            }
        } catch (error) {
            console.error(error);
            showError('Đã xảy ra lỗi khi tải dữ liệu');
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory(currentPage);
    }, []);

    const handlePageChange = (page: number) => {
        fetchCategory(page);
    };


    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await deleteCategory(id);
            setData((prev) => prev.filter((item) => item.id !== id));
            showSuccess('Đã xoá danh mục');
        } catch (error) {
            console.error(error);
            showError('Xoá danh mục thất bại');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>
            <h2>Danh sách người bán</h2>
            {loading ? (
                <LoadingDefault />
            ) : (
                <CustomTable<Category>
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    total={total}
                    scrollY={window.innerHeight - 300}
                    onPageChange={handlePageChange}

                    onDelete={handleDelete}
                />
            )}

        </div>
    );
}
