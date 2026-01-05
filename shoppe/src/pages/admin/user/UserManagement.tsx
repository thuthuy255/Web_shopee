import { useEffect, useState } from "react";
import { Flex, message } from "antd";
import type { TableColumnsType } from "antd";
import CustomTable from "../../../components/CustomTable";
import { useNavigate } from "react-router-dom";
import { deleteSeller } from "../../../api/seller/seller.api";
import { showError, showSuccess, showWarning } from "../../../untils/ShowToast";
import LoadingDefault from "../../../components/loading/LoadingDefault";
import Search from "antd/es/input/Search";
import { getAllUser } from "../../../api/user.api";
import { ToggleLock } from "../../../api/auth.api";

interface Seller {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isLocked: boolean;
  created: string;
}

const columns: TableColumnsType<Seller> = [
  {
    title: "Họ và tên",
    dataIndex: "username",
    key: "username",
    align: "center",
    render: (value, record) => value || record?.fullName || "Chưa cập nhật",
  },

  { title: "Email", dataIndex: "email", key: "email", align: "center" },
  { title: "Số điện thoại", dataIndex: "phone", key: "phone", align: "center" },
  {
    title: "Ngày tạo",
    dataIndex: "created",
    key: "created",
    render: (value) => new Date(value).toLocaleString("vi-VN"),
    align: "center",
  },
  {
    title: "Trạng thái",
    dataIndex: "isLocked",
    key: "isLocked",
    render: (value: boolean) => (value ? "Bị khóa" : "Hoạt động"),
    align: "center",
  },
];

export default function UserManagement() {
  const [data, setData] = useState<Seller[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Hàm gọi API
  const fetchSellers = async (page: number, key: string) => {
    try {
      setLoading(true);
      const body = {
        pageInfo: { page, pageSize },
        keyWord: key,
      };
      const res: any = await getAllUser(body);
      if (res?.success) {
        setData(res?.data);
        setTotal(res?.totalRecord);
        setCurrentPage(page);
      } else {
        message.error("Không thể lấy danh sách người bán");
      }
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchSellers(currentPage, keyword);
  }, []);

  const handlePageChange = (page: number) => fetchSellers(page, keyword);

  // Hàm xử lý khi bấm search
  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchSellers(1, value);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSeller(id);
      setData((prev) => prev.filter((s) => s.id !== id));
      showSuccess("Đã xoá người bán");
    } catch (error) {
      console.error(error);
      showError("Không thể xoá người bán");
    }
  };

  const handleToggleLock = async (id: string, currentLockStatus: boolean) => {
    if (!id) return;
    try {
      // Gọi API để toggle lock status
      const response: any = await ToggleLock(id);
      if (response?.success) {
        // Cập nhật data local
        setData((prev) =>
          prev.map((seller) =>
            seller.id === id
              ? { ...seller, isLocked: !currentLockStatus }
              : seller
          )
        );
        showSuccess(response?.message);
      } else {
        showWarning(response?.message);
      }
    } catch (error) {
      console.error(error);
      showError("Không thể thay đổi trạng thái khóa");
    }
  };

  return (
    <div>
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <h2>Danh sách người dùng</h2>
        <Search
          placeholder="Tìm kiếm theo tên, email..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ marginBottom: 16, width: 300 }}
        />
      </Flex>
      {loading ? (
        <LoadingDefault />
      ) : (
        <CustomTable<Seller>
          rowKey="id"
          columns={columns}
          dataSource={data}
          pageSize={pageSize}
          currentPage={currentPage}
          total={total}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onToggleLock={handleToggleLock}
          lockStatusKey="isLocked"
        />
      )}
    </div>
  );
}
