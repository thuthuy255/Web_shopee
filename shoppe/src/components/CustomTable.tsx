import React, { useMemo } from 'react';
import {
    Table,
    Button,
    Popconfirm,
    Space,
    Tooltip,
    Card,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface CustomTableProps<T> {
    rowKey: string;
    columns: TableColumnsType<T>;
    dataSource: T[];
    pageSize: number;
    currentPage: number;
    total: number;
    scrollY?: number;
    loading?: boolean; // ✅ Thêm loading prop
    onPageChange?: (page: number, pageSize: number) => void;
    onAdd?: () => void;
    onView?: (record: T) => void;
    onDelete?: (id: string) => void;
    title?: string;
}

function CustomTable<T>({
    rowKey,
    columns,
    dataSource,
    pageSize = 10,
    currentPage = 1,
    total = 0,
    scrollY = 400,
    loading = false,
    onAdd,
    onView,
    onDelete,
    onPageChange,
    title = 'Danh sách',
}: CustomTableProps<T>) {
    const actionColumn = useMemo<TableColumnsType<T>[number]>(() => ({
        title: 'Thao tác',
        key: 'action',
        align: 'center',
        render: (_, record) => {
            const id = String(record[rowKey as keyof T]);
            return (
                <Space size="middle">
                    {onView && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                shape="circle"
                                style={{
                                    backgroundColor: '#faad14',
                                    borderColor: '#faad14',
                                    color: '#fff',
                                }}
                                onClick={() => onView(record)}
                            />
                        </Tooltip>
                    )}

                    {onDelete && (
                        <Tooltip title="Xoá">
                            <Popconfirm
                                title="Bạn có chắc muốn xoá mục này không?"
                                onConfirm={() => onDelete(id)}
                                okText="Xoá"
                                cancelText="Huỷ"
                            >
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    shape="circle"
                                    style={{
                                        backgroundColor: '#ff4d4f',
                                        borderColor: '#ff4d4f',
                                        color: '#fff',
                                    }}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            );
        }
    }), [onView, onDelete, rowKey]);

    return (
        <Card
            title={<span style={{ fontWeight: 580 }}>{title}</span>}
            extra={
                onAdd && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                        Thêm mới
                    </Button>
                )
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
            <Table<T>
                rowKey={rowKey}
                columns={[...columns, actionColumn]}
                dataSource={dataSource}
                loading={loading} // ✅ Truyền loading vào bảng
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: onPageChange,
                    showSizeChanger: false,
                }}
                scroll={{ y: scrollY }}
                rowClassName={() => 'custom-table-row'}
            />
        </Card>
    );
}

export default CustomTable;
