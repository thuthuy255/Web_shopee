import React, { useEffect, useState } from "react";
import { Flex, message, type TableColumnsType } from "antd";
import Search from "antd/es/input/Search";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../../components/CustomTable";
import LoadingDefault from "../../../components/loading/LoadingDefault";
import { getUserOrders, getUserOrdersOfSeller } from "../../../api/order/order.api";

interface Order {
    id: string;
    userName: string;
    addressDetail: string;
    promotionCode?: string;
    totalAmount: number;
    paymentMethod: string;
    txnRef?: string;
    paymentStatus: string;
    created: string;
}
const columns: TableColumnsType<Order> = [
    {
        title: "Mã đơn",
        dataIndex: "id",
        key: "id",
        width: "15%",
        align: "center",
    },
    // {
    //     title: "Người đặt",
    //     dataIndex: "userName",
    //     key: "userName",
    //     width: "15%",
    //     align: "center",
    // },
    {
        title: "Địa chỉ",
        dataIndex: "addressDetail",
        key: "addressDetail",
        ellipsis: true,
        width: "20%",
        align: "center",
    },
    {
        title: "Ngày tạo",
        dataIndex: "created",
        key: "created",
        render: (date) => new Date(date).toLocaleString(),
        width: "15%",
        align: "center",
    },
    {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        render: (amount) => `${amount.toLocaleString()} ₫`,
        width: "10%",
        align: "center",
    },
    {
        title: "Khuyến mãi",
        dataIndex: "promotionCode",
        key: "promotionCode",
        width: "10%",
        render: (code) => code || "—",
        align: "center",
    },
    {
        title: "Thanh toán",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        width: "10%",
        align: "center",
    },
    {
        title: "Mã giao dịch",
        dataIndex: "txnRef",
        key: "txnRef",
        width: "15%",
        align: "center",
    },
    {
        title: "Trạng thái",
        dataIndex: "paymentStatus",
        key: "paymentStatus",
        width: "10%",
        align: "center",
        render: (status: number) => {
            switch (status) {
                case 0:
                    return <span style={{ backgroundColor: "orange", padding: '3px', borderRadius: '5px', color: 'white' }}>Chờ thanh toán</span>;
                case 1:
                    return <span style={{ backgroundColor: "#54f080ff", padding: '3px', borderRadius: '5px', color: 'white' }}>Đã thanh toán</span>;
                case 2:
                    return <span style={{ backgroundColor: "#f05454ff", padding: '3px', borderRadius: '5px', color: 'white' }}>Thất bại</span>;
                case 3:
                    return <span style={{ backgroundColor: "blue", padding: '3px', borderRadius: '5px', color: 'white' }}>Đã hoàn tiền</span>;
                default:
                    return status;
            }
        },

    },


];

const OrderManagement = () => {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const fetchOrders = async (page: number, key: string) => {
        try {
            setLoading(true);
            const body = {
                pageInfo: { page, pageSize },
                keyWord: key,
            };
            const res: any = await getUserOrdersOfSeller(body);
            if (res?.success) {
                setData(res.data);
                setTotal(res.totalRecord);
                setCurrentPage(page);
            } else {
                message.error("Không thể lấy danh sách đơn hàng");
            }
        } catch (error) {
            console.error(error);
            message.error("Đã xảy ra lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = debounce((value: string) => {
        fetchOrders(1, value);
    }, 500);

    useEffect(() => {
        debouncedFetch(keyword);
        return () => debouncedFetch.cancel();
    }, [keyword]);


    return (
        <div>
            <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
                <h2>Danh sách đơn hàng</h2>
                <Search
                    placeholder="Tìm kiếm theo mã đơn, người đặt..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ marginBottom: 16, width: 300 }}
                />
            </Flex>
            {loading ? (
                <LoadingDefault />
            ) : (
                <CustomTable<Order>
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    total={total}
                    onPageChange={(page) => fetchOrders(page, keyword)}
                // onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default OrderManagement;
