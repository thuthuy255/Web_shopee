import React, { useEffect, useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { inserProduct } from '../../../api/product/product.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../../api/category/category.api';

export default function ProductsCreate() {
    const formRef = useRef<any>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);

    const currentPage = 1;
    const pageSize = 100; // Hoặc số phù hợp để lấy hết danh mục

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const body = {
                    pageInfo: { page: currentPage, pageSize },
                    keyWord: '',
                    filter: {},
                    sorts: {},
                };

                const res: any = await getAllCategories(body);

                if (res.success && Array.isArray(res.data)) {
                    const options = res.data.map((item: any) => ({
                        label: item.name,
                        value: item.id,
                    }));
                    setCategoryOptions(options);
                } else {
                    showError(res.message || 'Không thể tải danh mục');
                }
            } catch (err) {
                showError('Không thể tải danh mục');
                console.error(err);
            }
        };

        fetchCategories();
    }, []);

    const fields: Field[] = [
        { name: 'id', type: 'hidden' },
        { name: 'sellerId', type: 'hidden' },

        {
            name: 'productName',
            label: 'Tên sản phẩm',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                { max: 255, message: 'Tên sản phẩm tối đa 255 ký tự' }
            ],
        },
        {
            name: 'description',
            label: 'Mô tả sản phẩm',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập mô tả' },
                { max: 255, message: 'Mô tả tối đa 255 ký tự' }
            ],
        },

        {
            name: 'price',
            label: 'Giá bán',
            type: 'text',
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
            name: 'stockQuantity',
            label: 'Tồn kho',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập tồn kho' },
                { pattern: /^[0-9]+$/, message: 'Tồn kho phải là số' },
            ],
        },
        {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
                { label: 'Hoạt động', value: 'active' },
                { label: 'Ngừng bán', value: 'inactive' }
            ],
            rules: [{ required: true, message: 'Vui lòng chọn trạng thái' }],
        },
        {
            name: 'categoryId',
            label: 'Danh mục',
            type: 'select',
            options: categoryOptions,
            rules: [{ required: true, message: 'Vui lòng chọn danh mục' }],
        },
        {
            name: 'thumbnail',
            label: 'Ảnh đại diện',
            type: 'file',
            rules: [{ required: true, message: 'Vui lòng chọn ảnh đại diện' }],
        },
        {
            name: 'ProductImages',
            label: 'Ảnh chi tiết (có thể chọn nhiều)',
            type: 'file',
        },
    ];

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('productName', values.productName);
            formData.append('description', values.description);
            formData.append('price', values.price.toString());
            formData.append('stockQuantity', values.stockQuantity.toString());
            formData.append('status', values.status);
            formData.append('categoryId', values.categoryId);

            if (values.thumbnail?.file instanceof File) {
                formData.append('thumbnail', values.thumbnail.file);
            }

            if (values.ProductImages) {
                // Trường hợp là mảng fileList
                const files = Array.isArray(values.ProductImages)
                    ? values.ProductImages
                    : values.ProductImages.fileList || [];

                files.forEach((f: any) => {
                    const fileObj = f.originFileObj || f.file;
                    if (fileObj instanceof File) {
                        formData.append("ProductImages", fileObj);
                    }
                });
            }
            await inserProduct(formData);
            showSuccess('Thêm sản phẩm thành công');
            navigate('/seller/products');
        } catch (error) {
            showError('Lỗi khi thêm sản phẩm');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>🛒 Thêm sản phẩm mới</h2>
            <DynamicForm
                fields={fields}
                onSubmit={handleSubmit}
                formRef={formRef}
                loading={loading}
                submitText="Thêm sản phẩm"
            />
        </div>
    );
}
