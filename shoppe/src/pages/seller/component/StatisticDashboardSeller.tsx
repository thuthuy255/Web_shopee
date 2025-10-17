import { memo } from "react";
import DashboardStatistic, {
    type StatisticItem,
} from "../../../components/DashboardStatistic";
import {
    AppstoreOutlined,
    GiftOutlined,
    ShopOutlined,
    UnorderedListOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { queryGetStatisticSellerAsync } from "../../../api/stastic/stastic.query";

function StatisticDashboardSeller() {
    const { data, isLoading } = queryGetStatisticSellerAsync();
    const statisticData: StatisticItem[] = [
        {
            title: "Sản phẩm",
            value: data?.data?.totalProducts,
            prefix: <ShopOutlined />,
            color: "#1890ff",
            path: "/Seller/products",
        },
        {
            title: "Danh mục",
            value: data?.data?.totalCategories,
            prefix: <AppstoreOutlined />,
            color: "#722ed1",
            path: '/Seller/category'
        },
        {
            title: "Đơn hàng",
            value: data?.data?.totalOrders,
            prefix: <UnorderedListOutlined />,
            color: "#d1982eff",
            path: '/Seller/orders'
        },
    ];
    return <DashboardStatistic data={statisticData} loading={isLoading} />;
}

export default memo(StatisticDashboardSeller);
