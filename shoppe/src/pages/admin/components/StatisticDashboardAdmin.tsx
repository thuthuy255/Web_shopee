import { memo } from "react";
import DashboardStatistic, {
  type StatisticItem,
} from "../../../components/DashboardStatistic";
import {
  AppstoreOutlined,
  GiftOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { queryGetStatisticAdminAsync } from "../../../api/stastic/stastic.query";

function StatisticDashboardAdmin() {
  const { data, isLoading } = queryGetStatisticAdminAsync();
  const statisticData: StatisticItem[] = [
    {
      title: "Người bán",
      value: data?.data?.totalQuantitySeller,
      prefix: <UserOutlined />,
      color: "#3f8600",
      path: "/Admin/seller",
    },
    {
      title: "Sản phẩm",
      value: data?.data?.totalProducts,
      prefix: <ShopOutlined />,
      color: "#1890ff",
      path: "/Admin/products",
    },
    {
      title: "Khuyến mãi",
      value: data?.data?.totalVoucher,
      prefix: <GiftOutlined />,
      color: "#faad14",
      path: "/Admin/promotions",
    },
    {
      title: "Danh mục",
      value: data?.data?.totalCategory,
      prefix: <AppstoreOutlined />,
      color: "#722ed1",
      path: "/Admin/category",
    },
  ];
  return <DashboardStatistic data={statisticData} loading={isLoading} />;
}

export default memo(StatisticDashboardAdmin);
