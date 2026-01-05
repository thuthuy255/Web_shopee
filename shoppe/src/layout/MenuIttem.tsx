// utils/getMenuByRole.tsx
import {
  PieChartOutlined,
  UploadOutlined,
  UserOutlined,
  ProductOutlined,
  ShoppingOutlined,
  GiftOutlined,
  PictureOutlined,
  AppstoreOutlined,
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
    { key: "user", icon: <UserOutlined />, label: "Quản lý người dùng" },

    { key: "products", icon: <ShoppingOutlined />, label: "Quản lý sản phẩm" },
    { key: "promotions", icon: <GiftOutlined />, label: "Quản lý khuyến mãi" },
    { key: "banner", icon: <PictureOutlined />, label: "Quản lý banner" },
    { key: "category", icon: <AppstoreOutlined />, label: "Quản lý danh mục" },
  ];

  const sellerItems: MenuProps["items"] = [
    { key: "dashboard", icon: <PieChartOutlined />, label: "Bảng điều khiển" },
    { key: "category", icon: <BiCategory />, label: "Quản lý danh mục" },
    { key: "products", icon: <ProductOutlined />, label: "Quản lý sản phẩm" },
    // { key: "productVariants", icon: <ProductOutlined />, label: "Quản lý biến thể sản phẩm" },
    { key: "orders", icon: <UploadOutlined />, label: "Quản lý đơn hàng" },
    { key: "analystic", icon: <PiFlagBanner />, label: "Thống kê" },
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
