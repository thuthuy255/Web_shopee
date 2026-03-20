import React, { useMemo } from "react";
import { Table, Button, Popconfirm, Space, Tooltip, Card, Switch } from "antd";
import type { TableColumnsType } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

interface CustomTableProps<T> {
  rowKey: string;
  columns: TableColumnsType<T>;
  dataSource: T[];
  pageSize: number;
  currentPage: number;
  total: number;
  loading?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
  onAdd?: () => void;
  onView?: (record: T) => void;
  onDelete?: (id: string) => void;
  onToggleLock?: (id: string, currentLockStatus: boolean) => void;
  lockStatusKey?: string; // Key để lấy trạng thái khóa từ record (mặc định: 'isLocked')
  title?: string;
  scrollY?: number;
}

function CustomTable<T>({
  rowKey,
  columns,
  dataSource,
  pageSize = 10,
  currentPage = 1,
  total = 0,
  loading = false,
  onAdd,
  onView,
  onDelete,
  onToggleLock,
  lockStatusKey = "isLocked",
  onPageChange,
  title = "Danh sách",
}: CustomTableProps<T>) {
  // ✅ Cột thao tác chỉ tạo khi có onView, onDelete hoặc onToggleLock
  const actionColumn = useMemo<TableColumnsType<T>[number] | null>(() => {
    if (!onView && !onDelete && !onToggleLock) return null;

    return {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => {
        const id = String(record[rowKey as keyof T]);
        const isLocked = Boolean(record[lockStatusKey as keyof T]);

        return (
          <Space
            size="middle"
            style={{ justifyContent: "center", display: "flex" }}
          >
            {onView && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  icon={<EditOutlined />}
                  shape="circle"
                  style={{
                    backgroundColor: "#faad14",
                    borderColor: "#faad14",
                    color: "#fff",
                  }}
                  onClick={() => onView(record)}
                />
              </Tooltip>
            )}

            {onToggleLock && (
              <Tooltip title={isLocked ? "Mở khóa" : "Khóa"}>
                <Popconfirm
                  title={
                    isLocked
                      ? "Bạn có chắc muốn mở khóa?"
                      : "Bạn có chắc muốn khóa?"
                  }
                  onConfirm={() => onToggleLock(id, isLocked)}
                  okText="Xác nhận"
                  cancelText="Huỷ"
                >
                  <Button
                    icon={isLocked ? <LockOutlined /> : <UnlockOutlined />}
                    shape="circle"
                    style={{
                      backgroundColor: isLocked ? "#faad14" : "#52c41a", // xanh = mở, cam = khóa
                      borderColor: isLocked ? "#faad14" : "#52c41a",
                      color: "#fff",
                    }}
                  />

                </Popconfirm>
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
                      backgroundColor: "#ff4d4f",
                      borderColor: "#ff4d4f",
                      color: "#fff",
                    }}
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    };
  }, [onView, onDelete, onToggleLock, rowKey, lockStatusKey]);

  // ✅ Nếu có actionColumn thì thêm vào cuối
  const finalColumns = useMemo(() => {
    return actionColumn ? [...columns, actionColumn] : columns;
  }, [columns, actionColumn]);

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
      style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
    >
      <Table<T>
        rowKey={rowKey}
        columns={finalColumns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: onPageChange,
          showSizeChanger: false,
        }}
        rowClassName={() => "custom-table-row"}
      />
    </Card>
  );
}

export default CustomTable;
