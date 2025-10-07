import React, { useEffect, useState } from "react";
import { Table, Button, DatePicker, message, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { GetSellerOrderStatistic } from "../../../api/stastic/stastic.api";
import type { ColumnsType } from "antd/es/table";

const { RangePicker } = DatePicker;

interface OrderStatisticItem {
    orderCode: string;
    createdDate: string;
    status: "Paid" | "Failed" | "Pending";
    totalAmount: number;
    paymentMethod: string;
    userName: string; // Người tạo
}

const OrderStatistics = () => {
    const [orders, setOrders] = useState<OrderStatisticItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    // Lấy dữ liệu đơn hàng
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined;
            const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined;

            const res: any = await GetSellerOrderStatistic({ fromDate, toDate });

            if (res?.success) {
                setOrders(res.data.orders);
            } else {
                setOrders([]);
                message.warning(res?.data?.error || "Không có đơn hàng nào");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi lấy dữ liệu đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    // Xuất Excel đẹp với exceljs
    const exportExcel = async () => {
        if (!orders || orders.length === 0) {
            message.warning("Không có dữ liệu để xuất Excel");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Đơn hàng");

        // Tạo header
        sheet.columns = [
            { header: "Mã đơn", key: "orderCode", width: 40, alignment: { horizontal: "center" } },
            { header: "Ngày tạo", key: "createdDate", width: 22, alignment: { horizontal: "center" } },
            { header: "Tài khoản", key: "userName", width: 20, alignment: { horizontal: "center" } },
            { header: "Trạng thái", key: "status", width: 15, alignment: { horizontal: "center" } },
            { header: "Tổng tiền", key: "totalAmount", width: 15, alignment: { horizontal: "center" } },
            { header: "Phương thức thanh toán", key: "paymentMethod", width: 27, alignment: { horizontal: "center" } },
        ];

        // Style header: màu xanh, chữ trắng, bôi đậm, căn giữa
        sheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "4F81BD" },
            };
            cell.font = { color: { argb: "FFFFFF" }, bold: true, name: "Calibri", size: 12 };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        // Thêm dữ liệu
        orders.forEach((o) => {
            sheet.addRow({
                orderCode: o.orderCode,
                createdDate: dayjs(o.createdDate).format("DD/MM/YYYY HH:mm"),
                userName: o.userName,
                status: o.status === "Paid" ? "Đã thanh toán" : o.status === "Failed" ? "Thất bại" : "Đang chờ",
                totalAmount: o.totalAmount,
                paymentMethod: o.paymentMethod,
            });
        });

        // Style dữ liệu: căn giữa, định dạng tiền
        sheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.alignment = { horizontal: "center", vertical: "middle" };
                if (colNumber === 5 && rowNumber !== 1) {
                    // Tổng tiền căn phải và format VNĐ
                    cell.alignment = { horizontal: "right" };
                    cell.numFmt = "#,##0₫";
                }
            });
        });

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, `OrderStatistic_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Columns bảng
    const columns: ColumnsType<OrderStatisticItem> = [
        { title: "Mã đơn", dataIndex: "orderCode", key: "orderCode", align: "center" },
        {
            title: "Ngày tạo",
            dataIndex: "createdDate",
            key: "createdDate",
            render: (text: string) => dayjs(text).format("DD/MM/YYYY HH:mm"),
            align: "center",
        },
        { title: "Người thanh toán", dataIndex: "userName", key: "userName", align: "center" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value: string) =>
                value === "Paid" ? "Đã thanh toán" : value === "Failed" ? "Thất bại" : "Đang chờ",
            align: "center",
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (value: number) => value.toLocaleString("vi-VN") + " đ",
            align: "center",
        },
        {
            title: "Phương thức thanh toán",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            align: "center",
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <RangePicker
                    value={dateRange as any}
                    onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                />
                <Button type="primary" onClick={fetchOrders}>
                    Lọc
                </Button>
                <Button onClick={exportExcel}>Xuất Excel</Button>
            </Space>

            <Table rowKey="orderCode" columns={columns} dataSource={orders} loading={loading} />
        </div>
    );
};

export default OrderStatistics;
