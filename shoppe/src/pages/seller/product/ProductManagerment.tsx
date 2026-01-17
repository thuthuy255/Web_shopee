import React, { useEffect, useState, useCallback } from "react";
import type { TableColumnsType } from "antd";
import { Flex, message, Select, Tag } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import CustomTable from "../../../components/CustomTable";
import { useNavigate } from "react-router-dom";
import {
  deleteProduct,
  getAllProductOfSeller,
} from "../../../api/product/product.api";
import LoadingDefault from "../../../components/loading/LoadingDefault";
import Search from "antd/es/input/Search";
import { showError, showSuccess } from "../../../untils/ShowToast";

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  thumbnail: string;
  isActive: boolean;
  sellerStatus: boolean;
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  categoryImageUrl: string;
}

// Hàm tính trạng thái hiển thị 3 loại
const getProductStatus = (product: Product) => {
  if (product.stockQuantity === 0 && !product.isActive) return "outOfStock";
  if (product.sellerStatus) return "active";
  return "inactive"; // isActive false && stock >0
};

// Cột table
const columns: TableColumnsType<Product> = [
  {
    title: "Tên sản phẩm",
    dataIndex: "productName",
    key: "productName",
    align: "center",
    render: (text: string) => (
      <div
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "normal",
          maxWidth: 250,
        }}
      >
        {text}
      </div>
    ),
  },
  {
    title: "Danh mục",
    dataIndex: "categoryName",
    key: "categoryName",
    align: "center",
  },
  {
    title: "Giá",
    dataIndex: "price",
    key: "price",
    render: (price) => `${price.toLocaleString()} ₫`,
    align: "center",
  },
  {
    title: "Tồn kho",
    dataIndex: "stockQuantity",
    key: "stockQuantity",
    width: "7%",
    align: "center",
  },
  {
    title: "Trạng thái",
    key: "status",
    align: "center",
    render: (_, record: Product) => {
      const status = getProductStatus(record);
      if (status === "active")
        return <Tag color="green">Hoạt động</Tag>;
      if (status === "inactive")
        return <Tag color="orange">Ngưng bán</Tag>;
      return <Tag color="red">Hết hàng</Tag>;
    },
  },
  {
    title: "Ảnh",
    dataIndex: "thumbnail",
    key: "thumbnail",
    width: "5%",
    align: "center",
    render: (src: string) =>
      src ? (
        <img
          src={src}
          alt="ảnh sản phẩm"
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ) : (
        <p>Không có ảnh</p>
      ),
  },
];

export default function ProductManagement() {
  const [data, setData] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "active" | "inactive" | "outOfStock" | null
  >(null);
  const [filterSellerStatus, setFilterSellerStatus] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  const fetchProduct = useCallback(
    async (
      page: number,
      key: string,
      status: typeof filterStatus,
      sellerStatus: string | null
    ) => {
      try {
        setLoading(true);
        const body = {
          pageInfo: { page, pageSize },
          keyWord: key,
          status: status, // BE nên xử lý 3 trạng thái nếu có
          sellerStatus: sellerStatus,
        };
        const res: any = await getAllProductOfSeller(body);
        console.log("🚀 ~ ProductManagement ~ res:", res)
        if (res?.success) {
          setData(res?.data || []);
          setTotal(res?.totalRecord || 0);
          setCurrentPage(page);
        } else {
          showError("Không thể lấy danh sách sản phẩm");
        }
      } catch (e) {
        console.log(e);
        message.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchProduct(currentPage, keyword, filterStatus, filterSellerStatus);
  }, [currentPage, keyword, filterStatus, filterSellerStatus, fetchProduct]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleAdd = () => navigate("/seller/products/create");
  const handleView = (record: Product) =>
    navigate(`/seller/products/edit/${record.id}`);
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);

      const res: any = await deleteProduct(id);

      // ❌ Delete thất bại
      if (!res?.success) {
        message.error(res?.message || "Xóa sản phẩm thất bại");
        return;
      }

      // ✅ Update UI sau khi delete thành công
      setData((prev) => prev.filter((item) => item.id !== id));

      setTotal((prev) => Math.max(0, prev - 1));

      showSuccess(res?.message || "Xóa sản phẩm thành công");
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi xóa sản phẩm");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <Flex vertical gap={16}>
        {/* Header */}
        <Flex align="center" justify="space-between">
          <h2 style={{ margin: 0 }}>Danh sách sản phẩm</h2>
          <Search
            placeholder="Tìm kiếm theo tên, danh mục..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 350 }}
            size="large"
          />
        </Flex>

        {/* Filter Section */}
        <Flex
          align="center"
          gap={12}
          style={{
            padding: "12px 16px",
            background: "#fafafa",
            borderRadius: 8,
            border: "1px solid #f0f0f0",
          }}
        >
          <Flex align="center" gap={8}>
            <FilterOutlined style={{ color: "#1890ff", fontSize: 16 }} />
            <span style={{ fontWeight: 500, color: "#595959" }}>Bộ lọc:</span>
          </Flex>

          {/* Filter trạng thái 3 loại */}
          <Select
            placeholder="Tất cả trạng thái"
            allowClear
            style={{ minWidth: 200 }}
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              setCurrentPage(1);
            }}
            suffixIcon={null}
          >
            <Select.Option value="active">
              <Tag color="green" style={{ margin: 0 }}>
                Hoạt động
              </Tag>
            </Select.Option>
            <Select.Option value="inactive">
              <Tag color="orange" style={{ margin: 0 }}>
                Ngưng bán
              </Tag>
            </Select.Option>

          </Select>

          {/* Filter sellerStatus */}

        </Flex>
      </Flex>

      {/* Table */}
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <LoadingDefault />
        ) : (
          <CustomTable<Product>
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
    </div>
  );
}
