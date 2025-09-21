// src/components/dashboard/DashboardStatistic.tsx
import React, { memo } from "react";
import { Row, Col, Card, Statistic, Skeleton } from "antd";

export interface StatisticItem {
  title: string;
  value: number;
  prefix: React.ReactNode;
  color?: string;
  suffix?: string;
}

interface DashboardStatisticProps {
  data: StatisticItem[];
  loading?: boolean;
}

const DashboardStatistic: React.FC<DashboardStatisticProps> = ({
  data,
  loading = false,
}) => {
  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      {data.map((item, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card>
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
