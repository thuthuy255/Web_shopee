// utils/getMenuByRole.tsx
import {
    PieChartOutlined,
    UploadOutlined,
    UserOutlined,
    ProductOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { BiCategory } from "react-icons/bi";
import { PiFlagBanner } from "react-icons/pi";
import { ROLE } from "../constants";

export const getMenuByRole = (roleId: string | null): MenuProps["items"] => {
    if (!roleId) return [];

    const adminItems: MenuProps["items"] = [
        { key: "dashboard", icon: <PieChartOutlined />, label: "Bảng điều khiển" },
        { key: "seller", icon: <UserOutlined />, label: "Quản lý người bán" },
        { key: "products", icon: <ProductOutlined />, label: "Quản lý sản phẩm" },
        { key: "banner", icon: <PiFlagBanner />, label: "Quản lý banner" },
        { key: "category", icon: <BiCategory />, label: "Quản lý danh mục" },
    ];

    const sellerItems: MenuProps["items"] = [
        { key: "category", icon: <BiCategory />, label: "Quản lý danh mục" },
        { key: "products", icon: <ProductOutlined />, label: "Quản lý sản phẩm" },
        // { key: "productVariants", icon: <ProductOutlined />, label: "Quản lý biến thể sản phẩm" },
        { key: "promotions", icon: <PiFlagBanner />, label: "Quản lý khuyến mãi" },
        { key: "orders", icon: <UploadOutlined />, label: "Đơn hàng" },
        { key: "analytics", icon: <PieChartOutlined />, label: "Thống kê" },
    ];

    switch (roleId) {
        case ROLE.ADMIN:
            return adminItems;
        case ROLE.SELLER:
            return sellerItems;
        default:
            return [];
    }
};

