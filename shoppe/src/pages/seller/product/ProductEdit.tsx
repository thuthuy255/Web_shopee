import React, { useEffect, useRef, useState } from "react";
import DynamicForm, { type Field } from "../../../components/DynamicForm";
import { useParams, useNavigate } from "react-router-dom";
import { Flex, message, Button, Space } from "antd";
import { useGetDetailProductQuery } from "../../../api/product/product.query";
import { updateProduct } from "../../../api/product/product.api";
import { getAllCategories } from "../../../api/category/category.api";
import { showError, showSuccess } from "../../../untils/ShowToast";
import VariantsForm from "../../../components/VariantsForm";
import LoadingDefault from "../../../components/loading/LoadingDefault";

export default function ProductEdit() {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const formRef = useRef<any>(null);
  const navigate = useNavigate();
  const [variants, setVariants] = useState<any[]>([]);
  const { data, isLoading } = useGetDetailProductQuery({ params: id });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const body = {
          pageInfo: { page: 1, pageSize: 100 },
          keyWord: "",
        };
        const res: any = await getAllCategories(body);
        if (res.success && Array.isArray(res.data)) {
          const options = res.data.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setCategoryOptions(options);
        }
      } catch (err) {
        showError("Không thể tải danh mục");
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (data?.data) {
      const product = data.data;
      setInitialValues({
        Id: product.id,
        productName: product.productName || "",
        description: product.description || "",
        Price: product.price || "",
        StockQuantity: product.stockQuantity || "",
        isActive: product.isActive || false,
        sellerStatus: product.sellerStatus || false,
        categoryId: product.categoryId || "",

        // Thumbnail
        Thumbnail: product.thumbnail
          ? {
            url: product.thumbnail,
            uid: "thumb",
            name: product.productName,
            status: "done",
          }
          : null,
        ProductImages:
          product.productImages?.map((url: string, idx: number) => ({
            url,
            uid: idx.toString(),
            name: `image-${idx}`,
            status: "done",
          })) || [],
      });
      setVariants(
        product.productVariants?.map((v: any) => ({
          id: v.id,
          variantName: v.variantName,
          variantValue: v.variantValue,
          price: v.price,
          stockQuantity: v.stockQuantity,
          imageUrl: v.imageUrl,
          imageFile: null,
        })) || []
      );
    }
  }, [data]);

  const fields: Field[] = [
    {
      name: "Id",
      type: "hidden",
    },

    {
      name: "productName",
      label: "Tên sản phẩm",
      type: "text",
      rules: [
        { required: true, message: 'Vui lòng nhập tên sản phẩm' },
        { max: 255, message: 'Tên sản phẩm tối đa 255 ký tự' }
      ],
    },

    {
      name: "description",
      label: "Mô tả",
      type: "text",
      rules: [
        { required: true, message: 'Vui lòng nhập mô tả' },
        { max: 255, message: 'Mô tả tối đa 255 ký tự' }
      ],
    },

    {
      name: "Price",
      label: "Giá",
      type: "number",
      rules: [
        { required: true, message: 'Vui lòng nhập giá' },
        {
          validator: (_: any, value: any) => {
            if (value === null || value === undefined || value === '') {
              return Promise.resolve();
            }

            // decimal(18,2): 16 số nguyên + 2 số thập phân
            if (!/^\d{1,16}(\.\d{1,2})?$/.test(value)) {
              return Promise.reject(
                'Giá tối đa 16 chữ số phần nguyên và 2 chữ số thập phân'
              );
            }

            return Promise.resolve();
          }
        }
      ],
    },

    {
      name: "StockQuantity",
      label: "Tồn kho",
      type: "number",
      rules: [
        { required: true, message: 'Vui lòng nhập tồn kho' },
        { pattern: /^[0-9]+$/, message: 'Tồn kho phải là số' },
      ],
    },

    {
      name: "sellerStatus",
      label: "Trạng thái",
      type: "select",
      rules: [
        { required: true, message: "Vui lòng chọn trạng thái sản phẩm" },
      ],
      options: [
        { label: "Hoạt động", value: true },
        { label: "Ngưng bán", value: false },
      ],
    },

    {
      name: "categoryId",
      label: "Danh mục",
      type: "select",
      rules: [
        { required: true, message: "Vui lòng chọn danh mục" },
      ],
      options: categoryOptions,
    },
    {
      name: "Thumbnail",
      label: "Ảnh đại diện",
      type: "file",
    },
    {
      name: "ProductImages",
      label: "Ảnh chi tiết (có thể chọn nhiều)",
      type: "file",
    },
  ];

  const handleSubmit = async (values: any) => {
    setLoadingSubmit(true);
    try {
      const formData = new FormData();

      // Basic fields
      formData.append("Id", values.Id);
      formData.append("ProductName", values.productName);
      formData.append("Description", values.description);
      formData.append("Price", values.Price.toString());
      formData.append("StockQuantity", values.StockQuantity.toString());
      formData.append("sellerStatus", values.sellerStatus.toString());
      formData.append("CategoryId", values.categoryId);

      // Thumbnail
      if (values.Thumbnail) {
        const file = values.Thumbnail.originFileObj || values.Thumbnail.file;
        if (file instanceof File) {
          formData.append("Thumbnail", file);
        } else if (values.Thumbnail.url) {
          formData.append("ExistingThumbnail", values.Thumbnail.url);
        }
      }

      // ProductImages
      if (
        values.ProductImages &&
        Array.isArray(values.ProductImages.fileList)
      ) {
        const fileList = values.ProductImages.fileList;

        // File mới
        const newFiles = fileList.filter((f: any) => f.originFileObj);
        newFiles.forEach((f: any) => {
          formData.append("ProductImages", f.originFileObj);
        });

        // Ảnh cũ (url)
        const existingUrls = fileList
          .filter((f: any) => !f.originFileObj && f.url)
          .map((f: any) => f.url);

        if (existingUrls.length > 0) {
          formData.append(
            "ExistingProductImages",
            JSON.stringify(existingUrls)
          );
        }
      }

      if (Array.isArray(variants)) {
        variants.forEach((v, i) => {
          if (v.id) formData.append(`Variants[${i}].Id`, v.id);
          formData.append(`Variants[${i}].VariantName`, v.variantName);
          formData.append(`Variants[${i}].VariantValue`, v.variantValue);
          formData.append(`Variants[${i}].Price`, v.price.toString());
          formData.append(
            `Variants[${i}].StockQuantity`,
            v.stockQuantity.toString()
          );
          if (v.imageFile instanceof File) {
            formData.append(`Variants[${i}].ImageFile`, v.imageFile);
          } else if (v.imageUrl) {
            formData.append(`Variants[${i}].ExistingImageUrl`, v.imageUrl);
          }
        });
      }

      const res = await updateProduct(values.Id, formData);

      if (res.data) {
        showSuccess("Cập nhật sản phẩm thành công");
        navigate("/seller/products");
      } else {
        message.error(res.data?.message || "Cập nhật sản phẩm thất bại");
      }
    } catch (err) {
      console.error(err);
      message.error("Đã xảy ra lỗi khi cập nhật sản phẩm");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Cập nhật sản phẩm</h2>
      {!isLoading ? (
        <>
          <DynamicForm
            formRef={formRef}
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitText="Cập nhật"
            isEdit
            loading={loadingSubmit}
            hideButtons={true}
          />
          <VariantsForm value={variants} onChange={setVariants} />

          {/* Nút xác nhận ở cuối */}
          <Flex justify="center" style={{ marginTop: 32, marginBottom: 32 }}>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                loading={loadingSubmit}
                onClick={handleFormSubmit}
                style={{ minWidth: 160 }}
              >
                Cập nhật
              </Button>

              <Button
                type="default"
                size="large"
                style={{ minWidth: 160 }}
                onClick={() => navigate(-1)}
                disabled={loadingSubmit}
              >
                Hủy
              </Button>
            </Space>
          </Flex>
        </>
      ) : (
        <Flex justify="center" style={{ marginTop: "5%" }}>
          <LoadingDefault />
        </Flex>
      )}
    </div>
  );
}
