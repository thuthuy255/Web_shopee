import { useEffect, useState } from 'react';
import { Flex, type TableColumnsType } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../../../untils/ShowToast';
import {
    deleteCategory,
    getAllCategories,
    getCategoryOfSeller,
} from '../../../api/category/category.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';
import { debounce } from 'lodash';
import Search from 'antd/es/input/Search';
import { useSelector } from 'react-redux';
import { getTokenState } from '../../../features/slices/app.slice';

interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    parentCategoryId?: string | null;
    sellerName: string;
}

export default function CategoryManagement() {
    const [data, setData] = useState<Category[]>([]);
    const token = useSelector(getTokenState);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

    /* ===================== COLUMNS ===================== */
    const columns: TableColumnsType<Category> = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            align: 'center',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            ellipsis: true,
            align: 'center',
        },
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            align: 'center',
            render: (url) => (
                <img
                    src={url}
                    alt="category"
                    style={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 4,
                    }}
                />
            ),
        },
        {
            title: 'Thuộc danh mục',
            dataIndex: 'parentCategoryId',
            align: 'center',
            render: (id?: string | null) =>
                id ? categoryMap[id] || 'Không xác định' : 'Không có',
        },
    ];

    /* ===================== FETCH CATEGORY ===================== */
    const fetchCategory = async (page: number, key: string) => {
        setLoading(true);
        try {
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: key,
            };

            const res: any = await getCategoryOfSeller(body);
            if (res?.success) {
                setData(res.data);
                setTotal(res.totalRecord);
                setCurrentPage(page);
            } else {
                showError('Không thể lấy danh sách danh mục');
            }
        } catch (error) {
            console.error(error);
            showError('Đã xảy ra lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    /* ===================== FETCH ALL CATEGORY (MAP) ===================== */
    const fetchAllCategories = async () => {
        try {
            const body = {
                pageInfo: {
                    page: 1,
                    pageSize: 1000,
                },
                keyWord: '',
            };

            const res: any = await getAllCategories(body);
            if (res?.success && Array.isArray(res.data)) {
                const map: Record<string, string> = {};
                res.data.forEach((item: any) => {
                    map[item.id] = item.name;
                });
                setCategoryMap(map);
            }
        } catch (error) {
            console.error('Lỗi load danh mục cha', error);
        }
    };

    useEffect(() => {
        fetchAllCategories();
    }, []);

    /* ===================== SEARCH ===================== */
    const debouncedFetch = debounce((value: string) => {
        fetchCategory(1, value);
    }, 500);

    useEffect(() => {
        debouncedFetch(keyword);
        return () => debouncedFetch.cancel();
    }, [keyword]);

    /* ===================== HANDLERS ===================== */
    const handlePageChange = (page: number) => {
        fetchCategory(page, keyword);
    };

    const handleAdd = () => {
        navigate('/seller/category/create');
    };

    const handleEdit = (record: Category) => {
        navigate(`/seller/category/edit/${record.id}`);
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

    /* ===================== RENDER ===================== */
    return (
        <div>
            <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
                <h2>Danh sách danh mục</h2>
                <Search
                    placeholder="Tìm kiếm theo tiêu đề, loại..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ width: 300 }}
                />
            </Flex>

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
                    onAdd={handleAdd}
                    onPageChange={handlePageChange}
                    onView={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
