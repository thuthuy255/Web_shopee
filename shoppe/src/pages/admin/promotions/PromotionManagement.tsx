import React, { useEffect, useState } from "react";
import type { TableColumnsType } from "antd";
import { Flex, message } from "antd";
import { debounce } from "lodash";
import Search from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import {
  deletePromotion,
  getPromotions,
} from "../../../api/promotion/promotion.api";
import CustomTable from "../../../components/CustomTable";
import LoadingDefault from "../../../components/loading/LoadingDefault";
import { showError, showSuccess } from "../../../untils/ShowToast";

interface Promotion {
  id: string;
  userId: string;
  code: string;
  description: string;
  discountPercent: number;
  minOrderValue: number;
  quantityLimit: number;
  usedQuantity: number;
  startDate: string;
  endDate: string;
  status: string;
  productName?: string;
  thumbnail?: string;
}

const statusMap: Record<string, string> = {
  Active: "Hoạt động",
  Expired: "Hết hạn",
  Inactive: "Ngừng áp dụng"
};

const columns: TableColumnsType<Promotion> = [
  { title: "Mã khuyến mãi", dataIndex: "code", key: "code", align: "center" },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
    ellipsis: true,
    align: "center",
  },
  {
    title: "Giảm (%)",
    dataIndex: "discountPercent",
    key: "discountPercent",
    render: (value) => `${value}%`,
    align: "center",
  },
  {
    title: "Đơn tối thiểu",
    dataIndex: "minOrderValue",
    key: "minOrderValue",
    render: (value) => `${value.toLocaleString()} ₫`,
    align: "center",
  },
  {
    title: "Giới hạn",
    dataIndex: "quantityLimit",
    key: "quantityLimit",
    align: "center",
  },
  {
    title: "Đã dùng",
    dataIndex: "usedQuantity",
    key: "usedQuantity",
    align: "center",
  },
  {
    title: "Hiệu lực",
    key: "dateRange",
    render: (_, record) => {
      const start = new Date(record.startDate).toLocaleDateString();
      const end = new Date(record.endDate).toLocaleDateString();
      return `${start} - ${end}`;
    },
    align: "center",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    align: "center",
    render: (status: string) => statusMap[status] || status,
  },
];

export default function PromotionManagement() {
  const [data, setData] = useState<Promotion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const fetchPromotion = async (page: number, key: string) => {
    try {
      setLoading(true);
      const body = {
        pageInfo: {
          page,
          pageSize,
        },
        keyWord: key,
      };

      const res: any = await getPromotions(body);
      if (res?.success) {
        setData(res.data);
        setTotal(res.totalRecord);
        setCurrentPage(page);
      } else {
        message.error("Không thể lấy danh sách khuyến mãi");
      }
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotion(currentPage, keyword);
  }, []);

  const handlePageChange = (page: number) => {
    fetchPromotion(page, keyword);
  };

  const handleAdd = () => {
    navigate("/admin/promotions/create");
  };

  const handleView = (record: Promotion) => {
    navigate(`/admin/promotions/edit/${record.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res: any = await deletePromotion(id); // giả sử API trả về object giống bạn gửi
      if (res?.success) {
        setData((prev) => prev.filter((item) => item.id !== id));
        showSuccess(res?.message || "Xoá mã khuyến mãi thành công");
      } else {
        showError(res?.message || "Xoá mã khuyến mãi thất bại");
      }
    } catch (error) {
      console.error(error);
      showError("Xoá mã khuyến mãi thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchPromotion(1, value || "");
  };

  return (
    <div>
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <h2>Danh sách khuyến mãi</h2>
        {/* <Search
          placeholder="Tìm kiếm theo mã hoặc mô tả..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 300 }}
          allowClear
        /> */}
        <Search
          placeholder="Tìm kiếm theo tên, email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          style={{ marginBottom: 16, width: 300 }}
          allowClear
        />
      </Flex>

      {loading ? (
        <LoadingDefault />
      ) : (
        <CustomTable<Promotion>
          rowKey="id"
          columns={columns}
          dataSource={data}
          pageSize={pageSize}
          currentPage={currentPage}
          total={total}
          onPageChange={handlePageChange}
          onAdd={handleAdd}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
