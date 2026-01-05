import React, { useEffect, useState, useCallback } from "react";
import type { TableColumnsType } from "antd";
import { Flex, message, Select, Space, Tag } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import CustomTable from "../../../components/CustomTable";
import { useNavigate } from "react-router-dom";
import {
  deleteProduct,
  getAllProductOfSeller,
} from "../../../api/product/product.api";
import LoadingDefault from "../../../components/loading/LoadingDefault";
import Search from "antd/es/input/Search";

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
    title: "Hoạt động",
    dataIndex: "isActive",
    key: "isActive",
    render: (value) => (
      <Tag color={value ? "green" : "red"}>
        {value ? "Hoạt động" : "Hết hàng"}
      </Tag>
    ),
    align: "center",
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
  const [filterIsActive, setFilterIsActive] = useState<string | null>(null);
  const [filterSellerStatus, setFilterSellerStatus] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  // Hàm fetch dữ liệu chính
  const fetchProduct = useCallback(
    async (
      page: number,
      key: string,
      isActive: string | null,
      sellerStatus: string | null
    ) => {
      try {
        setLoading(true);
        const body = {
          pageInfo: { page, pageSize },
          keyWord: key,
          isActive: isActive,
          sellerStatus: sellerStatus,
        };
        const res: any = await getAllProductOfSeller(body);
        if (res?.success) {
          setData(res?.data || []);
          setTotal(res?.totalRecord || 0);
          setCurrentPage(page);
        } else {
          message.error("Không thể lấy danh sách sản phẩm");
        }
      } catch (error) {
        console.error(error);
        message.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Load dữ liệu khi các dependencies thay đổi
  useEffect(() => {
    fetchProduct(currentPage, keyword, filterIsActive, filterSellerStatus);
  }, [currentPage, keyword, filterIsActive, filterSellerStatus, fetchProduct]);

  // Xử lý search
  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => setCurrentPage(page);

  // Xử lý thay đổi filter isActive
  const handleFilterIsActiveChange = (val: string | null) => {
    setFilterIsActive(val);
    setCurrentPage(1);
  };

  // Xử lý thay đổi filter sellerStatus
  const handleFilterSellerStatusChange = (val: string | null) => {
    setFilterSellerStatus(val);
    setCurrentPage(1);
  };

  const handleAdd = () => navigate("/seller/products/create");
  const handleView = (record: Product) =>
    navigate(`/seller/products/edit/${record.id}`);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteProduct(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
      message.success("Đã xoá sản phẩm");
    } catch (error) {
      console.error(error);
      message.error("Xoá sản phẩm thất bại");
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

          <Select
            placeholder="Tất cả trạng thái"
            allowClear
            style={{ minWidth: 180 }}
            value={filterIsActive}
            onChange={handleFilterIsActiveChange}
            suffixIcon={null}
          >
            <Select.Option value="true">
              <Tag color="green" style={{ margin: 0 }}>
                Hoạt động
              </Tag>
            </Select.Option>
            <Select.Option value="false">
              <Tag color="red" style={{ margin: 0 }}>
                Hết hàng
              </Tag>
            </Select.Option>
          </Select>

          <Select
            placeholder="Trạng thái người bán"
            allowClear
            style={{ minWidth: 180 }}
            value={filterSellerStatus}
            onChange={handleFilterSellerStatusChange}
            suffixIcon={null}
          >
            <Select.Option value="true">
              <Tag color="blue" style={{ margin: 0 }}>
                Đang bán
              </Tag>
            </Select.Option>
            <Select.Option value="false">
              <Tag color="orange" style={{ margin: 0 }}>
                Ngưng bán
              </Tag>
            </Select.Option>
          </Select>

          {/* Active Filters Display */}
          {(filterIsActive || filterSellerStatus) && (
            <Flex align="center" gap={8} style={{ marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: "#8c8c8c" }}>Đang lọc:</span>
              {filterIsActive && (
                <Tag
                  color={filterIsActive === "true" ? "green" : "red"}
                  closable
                  onClose={() => handleFilterIsActiveChange(null)}
                >
                  {filterIsActive === "true" ? "Hoạt động" : "Hết hàng"}
                </Tag>
              )}
              {filterSellerStatus && (
                <Tag
                  color={filterSellerStatus === "true" ? "blue" : "orange"}
                  closable
                  onClose={() => handleFilterSellerStatusChange(null)}
                >
                  {filterSellerStatus === "true" ? "Đang bán" : "Ngưng bán"}
                </Tag>
              )}
            </Flex>
          )}
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
