// src/components/dashboard/DashboardStatistic.tsx
import React, { memo } from "react";
import { Row, Col, Card, Statistic, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";

export interface StatisticItem {
  title: string;
  value: number;
  prefix: React.ReactNode;
  color?: string;
  suffix?: string;
  path?: string; // ✅ Thêm đường dẫn để điều hướng
}

interface DashboardStatisticProps {
  data: StatisticItem[];
  loading?: boolean;
}

const DashboardStatistic: React.FC<DashboardStatisticProps> = ({
  data,
  loading = false,
}) => {
  const navigate = useNavigate();

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      {data.map((item, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card
            hoverable
            style={{
              cursor: item.path ? "pointer" : "default",
              transition: "transform 0.2s",
            }}
            onClick={() => {
              if (item.path) navigate(item.path); // ✅ Điều hướng khi có path
            }}
            onMouseEnter={(e) => {
              if (item.path) e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Skeleton loading={loading} active paragraph={false}>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
                valueStyle={{ color: item.color || "#000" }}
              />
            </Skeleton>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default memo(DashboardStatistic);
