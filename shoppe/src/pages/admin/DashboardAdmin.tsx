// src/pages/admin/DashboardAdmin.tsx
import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { UserOutlined, ShopOutlined } from '@ant-design/icons';
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
} from 'recharts';
import type { StatisticItem } from '../../components/DashboardStatistic';
import DashboardStatistic from '../../components/DashboardStatistic';


const { Title } = Typography;

const DashboardAdmin: React.FC = () => {
  const sellerCount = 125;
  const productCount = 4321;

  const statisticData: StatisticItem[] = [
    {
      title: 'Người bán',
      value: sellerCount,
      prefix: <UserOutlined />,
      color: '#3f8600',
    },
    {
      title: 'Sản phẩm',
      value: productCount,
      prefix: <ShopOutlined />,
      color: '#1890ff',
    },
  ];

  const monthlyProductData = [
    { month: 'Th1', products: 300 },
    { month: 'Th2', products: 450 },
    { month: 'Th3', products: 510 },
    { month: 'Th4', products: 380 },
    { month: 'Th5', products: 620 },
    { month: 'Th6', products: 700 },
  ];

  const categoryData = [
    { name: 'Thời trang', value: 2000 },
    { name: 'Điện tử', value: 1200 },
    { name: 'Gia dụng', value: 600 },
    { name: 'Khác', value: 521 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Tổng quan hệ thống</Title>

      {/* ✅ Tái sử dụng phần thống kê */}
      <DashboardStatistic data={statisticData} />

      {/* ✅ Giữ nguyên phần biểu đồ */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Biểu đồ sản phẩm theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProductData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="products" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Tỉ lệ sản phẩm theo danh mục">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
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
