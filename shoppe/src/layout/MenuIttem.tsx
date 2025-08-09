import {
    PieChartOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    UserOutlined,
    TeamOutlined,
    ProductOutlined,
    BarcodeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { BiCategory } from 'react-icons/bi';
import { PiFlagBanner } from 'react-icons/pi';

export const getMenuByRole = (roleId: string | null): MenuProps['items'] => {
    if (!roleId) return [];

    const commonAdminItems: MenuProps['items'] = [
        { key: 'dashboard', icon: <PieChartOutlined />, label: 'Bảng điều khiển' },
        { key: 'seller', icon: <UserOutlined />, label: 'Quản lý người bán' },
        { key: 'products', icon: <ProductOutlined />, label: 'Quản lý sản phẩm' },
        { key: 'banner', icon: <PiFlagBanner />, label: 'Quản lý banner' },
        { key: 'category', icon: <BiCategory />, label: 'Quản lý danh mục' },
    ];

    const commonSellerItems: MenuProps['items'] = [
        { key: 'products', icon: <ProductOutlined />, label: 'Sản phẩm' },
        { key: 'promotions', icon: <BarcodeOutlined />, label: 'Quản lý khuyến mãi' },
        { key: 'orders', icon: <UploadOutlined />, label: 'Đơn hàng' },
        { key: 'analytics', icon: <PieChartOutlined />, label: 'Thống kê' },
    ];

    switch (roleId) {
        case 'admin':
            return commonAdminItems;
        case 'seller':
            return commonSellerItems;
        default:
            return [];
    }
};

