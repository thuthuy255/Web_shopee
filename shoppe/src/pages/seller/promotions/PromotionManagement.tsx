import type { TableColumnsType } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { deletePromotion, getPromotionsOfSeller } from '../../../api/promotion/promotion.api';
import CustomTable from '../../../components/CustomTable';
import LoadingDefault from '../../../components/loading/LoadingDefault';

export default function PromotionManagement() {
    interface Promotion {
        id: string;
        sellerId: string;
        code: string;
        description: string;
        discountPercent: number;
        minOrderValue: number;
        quantityLimit: number;
        usedQuantity: number;
        startDate: string;
        endDate: string;
        status: string;
        productName?: string;
        thumbnail?: string;
    }
    const statusMap: Record<string, string> = {
        Active: 'Hoạt động',
        Expired: 'Hết hạn',
        Inactive: 'Không hoạt động',
    };
    const columns: TableColumnsType<Promotion> = [
        { title: 'Mã khuyến mãi', dataIndex: 'code', key: 'code', align: 'center' },
        { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true, align: 'center' },
        {
            title: 'Giảm (%)',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            render: (value) => `${value}%`,
            align: 'center'
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (value) => `${value.toLocaleString()} ₫`,
            align: 'center'
        },
        { title: 'Số lượng giới hạn', dataIndex: 'quantityLimit', key: 'quantityLimit', align: 'center' },
        { title: 'Đã dùng', dataIndex: 'usedQuantity', key: 'usedQuantity', align: 'center' },
        {
            title: 'Hiệu lực',
            key: 'dateRange',
            render: (_, record) => {
                const start = new Date(record.startDate).toLocaleDateString();
                const end = new Date(record.endDate).toLocaleDateString();
                return `${start} - ${end}`;
            },
            align: 'center'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: string) => statusMap[status] || status,
        }

    ];

    const [data, setData] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const fetchPromotion = async (page: number) => {
        try {
            setLoading(true);
            const body = {
                pageInfo: {
                    page,
                    pageSize,
                },
                keyWord: '',
            };

            const res: any = await getPromotionsOfSeller(body);
            console.log("🚀 ~ fetchPromotion ~ res:", res)
            if (res?.success) {
                setData(res?.data);
                setTotal(res?.totalRecord);
                setCurrentPage(page);
            } else {
                showError('Không thể lấy danh sách khuyến mãi');
            }
        } catch (error) {
            console.error(error);
            showError('Đã xảy ra lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotion(currentPage);
    }, []);

    const handlePageChange = (page: number) => {
        fetchPromotion(page);
    };

    const handleAdd = () => {
        navigate('/seller/promotions/create');
    };

    const handleView = (record: Promotion) => {
        navigate(`/seller/promotions/edit/${record.id}`);
    };
    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await deletePromotion(id);
            setData((prev) => prev.filter((item) => item.id !== id));
            showSuccess('Đã xoá thành công mã khuyến mãi');
        } catch (error) {
            console.error(error);
            showError('Xoá mã khuyến mãi thất bại');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <h2>Danh sách khuyến mãi</h2>
            {loading ? (
                <LoadingDefault />
            ) : (
                <CustomTable<Promotion>
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    scrollY={window.innerHeight - 300}
                    loading={loading}
                    onAdd={handleAdd}
                    onView={handleView}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
