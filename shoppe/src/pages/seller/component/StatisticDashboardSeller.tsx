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
    console.log("🚀 ~ StatisticDashboardSeller ~ data:", data)
    const statisticData: StatisticItem[] = [
        {
            title: "Sản phẩm",
            value: data?.data?.totalProducts,
            prefix: <ShopOutlined />,
            color: "#1890ff",
        },
        {
            title: "Danh mục",
            value: data?.data?.totalCategories,
            prefix: <AppstoreOutlined />,
            color: "#722ed1",
        },
        {
            title: "Đơn hàng",
            value: data?.data?.totalOrders,
            prefix: <UnorderedListOutlined />,
            color: "#d1982eff",
        },
    ];
    return <DashboardStatistic data={statisticData} loading={isLoading} />;
}

export default memo(StatisticDashboardSeller);
