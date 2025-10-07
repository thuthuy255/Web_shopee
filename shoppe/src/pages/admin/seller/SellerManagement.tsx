import React, { useEffect, useState } from 'react';
import { Flex, Input, message } from 'antd';
import type { TableColumnsType } from 'antd';
import CustomTable from '../../../components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { getAllSeller, deleteSeller } from '../../../api/seller/seller.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import LoadingDefault from '../../../components/loading/LoadingDefault';
import { debounce } from 'lodash';
import Search from 'antd/es/input/Search';

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
    { title: 'Tên cửa hàng', dataIndex: 'fullName', key: 'fullName', align: 'center' },
    { title: 'Tên người bán', dataIndex: 'username', key: 'username', align: 'center' },
    { title: 'Email', dataIndex: 'email', key: 'email', align: 'center' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', align: 'center' },
    {
        title: 'Ngày tạo',
        dataIndex: 'created',
        key: 'created',
        render: (value) => new Date(value).toLocaleString('vi-VN'),
        align: 'center'

    },
    {
        title: "Trạng thái",
        dataIndex: "isLocked",
        key: "isLocked",
        render: (value: boolean) => (value ? "Bị khóa" : "Hoạt động"),
        align: 'center'
    }
];

export default function SellerManagement() {
    const [data, setData] = useState<Seller[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    // Hàm gọi API
    const fetchSellers = async (page: number, key: string) => {
        try {
            setLoading(true);
            const body = {
                pageInfo: { page, pageSize },
                keyWord: key,
            };
            const res: any = await getAllSeller(body);
            if (res?.success) {
                setData(res?.data);
                setTotal(res?.totalRecord);
                setCurrentPage(page);
            } else {
                message.error('Không thể lấy danh sách người bán');
            }
        } catch (error) {
            console.error(error);
            message.error('Đã xảy ra lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Debounce để giảm số lần gọi API khi gõ liên tục
    const debouncedFetch = debounce((value: string) => {
        fetchSellers(1, value); // luôn bắt đầu từ trang 1 khi search
    }, 500); // 500ms

    // Lắng nghe keyword thay đổi
    useEffect(() => {
        debouncedFetch(keyword);
        return () => debouncedFetch.cancel(); // hủy debounce khi unmount
    }, [keyword]);

    const handlePageChange = (page: number) => fetchSellers(page, keyword);
    const handleAdd = () => navigate('/admin/seller/create');
    const handleView = (record: Seller) => navigate(`/admin/seller/edit/${record.id}`);
    const handleDelete = async (id: string) => {
        try {
            await deleteSeller(id);
            setData((prev) => prev.filter((s) => s.id !== id));
            showSuccess('Đã xoá người bán');
        } catch (error) {
            console.error(error);
            showError('Không thể xoá người bán');
        }
    };

    return (
        <div>
            <Flex align='center' justify='space-between' style={{ marginBottom: 16 }}>
                <h2>Danh sách người bán</h2>
                <Search
                    placeholder="Tìm kiếm theo tên, email..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ marginBottom: 16, width: 300 }}
                />
            </Flex>
            {loading ? (
                <LoadingDefault />
            ) : (
                <CustomTable<Seller>
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    total={total}
                    // scrollY={window.innerHeight - 300}
                    onPageChange={handlePageChange}
                    onAdd={handleAdd}
                    onView={handleView}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
