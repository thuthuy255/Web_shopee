import { Flex } from 'antd';
import React, { memo } from 'react'

interface IInfoRowDetail {
    label: string;
    value?: React.ReactNode;
}
function InfoRowDetail(props: IInfoRowDetail) {
    const { label, value } = props;
    return (
        <Flex align="start" style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: 240, color: '#8c8c8c' }}>{label || 'Đang cập nhật'}</div>
            <div style={{ flex: 1, color: '#262626' }}>{value || 'Đang cập nhật'}</div>
        </Flex>
    )
}

export default memo(InfoRowDetail)