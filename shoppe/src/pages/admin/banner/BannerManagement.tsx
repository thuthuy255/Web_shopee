import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import type { TableColumnsType } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { deleteSeller, getAllSeller } from '../../../api/seller/seller.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { deleteBanner, getAllBanner } from '../../../api/banner/banner.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';

interface Banner {
    id: string;
    title?: string;
    imageUrl?: string;
    linkTo?: string;
    isActive: boolean;
}

const columns: TableColumnsType<Banner> = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    {
        title: 'Ảnh',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        render: (url: string) => (
            <img src={url} alt="banner" style={{ width: 120, height: 'auto', objectFit: 'cover' }} />
        ),
    },

    { title: 'Liên kết', dataIndex: 'linkTo', key: 'linkTo' },
    {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value: boolean) => (value ? 'Hiển thị' : 'Ẩn'),
    },
];


export default function BannerManagement() {
    const [data, setData] = useState<Banner[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const fetchBanner = async (page: number) => {
        setLoading(true);
        try {
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: '',
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

    useEffect(() => {
        fetchBanner(currentPage);
    }, []);

    const handlePageChange = (page: number) => {
        fetchBanner(page);
    };
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
            <h2>Danh sách người bán</h2>
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
