// src/components/dashboard/DashboardStatistic.tsx
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export interface StatisticItem {
    title: string;
    value: number;
    prefix: React.ReactNode;
    color?: string;
    suffix?: string;
}

interface DashboardStatisticProps {
    data: StatisticItem[];
}

const DashboardStatistic: React.FC<DashboardStatisticProps> = ({ data }) => {
    return (
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            {data.map((item, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                    <Card>
                        <Statistic
                            title={item.title}
                            value={item.value}
                            prefix={item.prefix}
                            suffix={item.suffix}
                            valueStyle={{ color: item.color || '#000' }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default DashboardStatistic;
