import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import type { TableColumnsType } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { deleteSeller, getAllSeller } from '../../../api/seller/seller.api';
import { showError, showSuccess } from '../../../untils/ShowToast';

interface Seller {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    isLocked: boolean;
    created: string;
}

const columns: TableColumnsType<Seller> = [
    { title: 'Tên cửa hàng', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Tên người bán', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    {
        title: 'Ngày tạo',
        dataIndex: 'created',
        key: 'created',
        render: (value) => new Date(value).toLocaleString('vi-VN'),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'isLocked',
        key: 'isLocked',
        render: (value) => (value ? 'Bị khoá' : 'Hoạt động'),
    },
];

export default function SellerManagement() {
    const [data, setData] = useState<Seller[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const fetchSellers = async (page: number) => {
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
            const res = await getAllSeller(body);
            if (res.data) {
                setData(res.data);
                setTotal(res.data?.totalRecord || (res.data?.length ?? 0));
                setCurrentPage(page);
            } else {
                message.error('Không thể lấy danh sách người bán');
            }
        } catch (error) {
            console.error(error);
            message.error('Đã xảy ra lỗi khi tải dữ liệu');
        }
    };

    useEffect(() => {
        fetchSellers(currentPage);
    }, []);

    const handlePageChange = (page: number) => {
        fetchSellers(page);
    };
    const handleAdd = () => {
        navigate('/admin/seller/create');
    };

    const handleView = (record: Seller) => {
        navigate(`/admin/seller/edit/${record.id}`);
    };

    const handleDelete = (id: string) => {
        try {
            deleteSeller(id);
            setData((prev) => prev.filter((s) => s.id !== id));
            showSuccess('Đã xoá người bán');
        }
        catch (error) {
            console.error(error);
            showError('Không thể xoá người bán');
        }
    };

    return (
        <div>
            <h2>Danh sách người bán</h2>
            <CustomTable<Seller>
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
