import React, { useEffect, useState } from 'react';
import { Flex, message } from 'antd';
import type { TableColumnsType } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { deleteSeller, getAllSeller } from '../../../api/seller/seller.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { deleteBanner, getAllBanner } from '../../../api/banner/banner.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';
import { debounce } from 'lodash';
import Search from 'antd/es/input/Search';

interface Banner {
    id: string;
    title?: string;
    imageUrl?: string;
    linkTo?: string;
    isActive: boolean;
    Type?: string;
}

const columns: TableColumnsType<Banner> = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', align: 'center' },
    {
        title: 'Ảnh',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        align: 'center',
        render: (url: string) => (
            <img src={url} alt="banner" style={{ width: 120, height: 'auto', objectFit: 'cover' }} />
        ),
    },
    {
        title: 'Loại',
        dataIndex: "type",
        key: 'Type',
        align: 'center'
    },
    { title: 'Liên kết', dataIndex: 'linkTo', key: 'linkTo', align: 'center' },
    {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value: boolean) => (value ? 'Hiển thị' : 'Ẩn'),
        align: 'center'
    },
];


export default function BannerManagement() {
    const [data, setData] = useState<Banner[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const handlePageChange = (page: number) => fetchBanner(page, keyword);


    const fetchBanner = async (page: number, key: string) => {
        setLoading(true);
        try {
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: key,
            };
            const res: any = await getAllBanner(body);
            if (res?.success) {
                setData(res.data);
                setTotal(res?.totalRecord || (res.data?.length ?? 0));
                setCurrentPage(page);
            } else {
                message.error('Không thể lấy danh sách người bán');
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
        fetchBanner(1, value); // luôn bắt đầu từ trang 1 khi search
    }, 500); // 500ms

    // Lắng nghe keyword thay đổi
    useEffect(() => {
        debouncedFetch(keyword);
        return () => debouncedFetch.cancel(); // hủy debounce khi unmount
    }, [keyword]);
    const handleAdd = () => {
        navigate('/admin/banner/create');
    };

    const handleView = (record: Banner) => {
        navigate(`/admin/banner/edit/${record.id}`);
    };

    const handleDelete = (id: string) => {
        try {
            deleteBanner(id);
            setData((prev) => prev.filter((s) => s.id !== id));
            showSuccess('Đã xoá banner');
        }
        catch (error) {
            console.error(error);
            showError('Không thể xoá banner');
        }
    };

    return (
        <div>
            <Flex align='center' justify='space-between' style={{ marginBottom: 16 }}>
                <h2>Danh sách Banner </h2>
                <Search
                    placeholder="Tìm kiếm theo tiêu đề, loại,..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ marginBottom: 16, width: 300 }}
                />
            </Flex>
            {loading ? (
                <LoadingDefault />
            ) : (
                <CustomTable<Banner>
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
            )
            }

        </div>
    );
}
