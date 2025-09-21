// src/pages/admin/DashboardAdmin.tsx
import { useState } from "react";
import { Card, Col, DatePicker, Row, Typography } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import StatisticDashboardAdmin from "./components/StatisticDashboardAdmin";
import {
  queryGetAnnualRevenueStatistics,
  queryGetProductPercentageByCategory,
} from "../../api/stastic/stastic.query";
import { formatCompactNumber, formatPriceVND } from "../../untils/FormatPrice";

const { Title } = Typography;

const DashboardAdmin = () => {
  const [year, setYear] = useState(dayjs().year());

  const { isLoading: isLoadingBarChart, data: revenueData } =
    queryGetAnnualRevenueStatistics({ year });

  const { isLoading: isLoadingPieChart, data: pieData } =
    queryGetProductPercentageByCategory();

  const handleYearChange = (date: any) => {
    if (date) setYear(date.year());
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AA46BE",
    "#FF6B6B",
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Tổng quan hệ thống</Title>

      {/* ✅ Phần thống kê trên cùng */}
      <StatisticDashboardAdmin />

      {/* ✅ Biểu đồ */}
      <Row gutter={[24, 24]}>
        {/* Doanh thu theo năm */}
        <Col xs={24} md={24}>
          <Card
            title={`Biểu đồ doanh thu năm ${year}`}
            loading={isLoadingBarChart}
            extra={
              <DatePicker
                picker="year"
                onChange={handleYearChange}
                defaultValue={dayjs()}
              />
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData?.data || []}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => `Th${value}`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => formatCompactNumber(value)}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) =>
                    `Doanh thu: ${formatPriceVND(value)}`
                  }
                  labelFormatter={(label) => `Tháng ${label}`}
                />
                <Bar dataKey="revenue" fill="#1890ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Tỉ lệ sản phẩm theo danh mục */}
        <Col xs={24} md={24}>
          <Card
            title="Top 5 danh mục có tỉ lệ sản phẩm nhiều nhất"
            loading={isLoadingPieChart}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData?.data || []}
                  dataKey="percentage"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) =>
                    `${entry.categoryName} (${entry.percentage}%)`
                  }
                >
                  {(pieData?.data || []).map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _: any, entry: any) =>
                    `${entry.payload.categoryName}: ${value}%`
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardAdmin;
