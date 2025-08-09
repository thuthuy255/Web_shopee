import React, { useEffect, useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Flex, message, Spin } from 'antd';
import { useGetDetailProductQuery } from '../../../api/product/product.query';
import { updateProduct } from '../../../api/product/product.api';
import { getAllCategories } from '../../../api/category/category.api';
import { showError, showSuccess } from '../../../untils/ShowToast';

export default function ProductEdit() {
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
    const formRef = useRef<any>(null);
    const navigate = useNavigate();

    const { data, isLoading } = useGetDetailProductQuery({ params: id });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const body = {
                    pageInfo: { page: 1, pageSize: 100 },
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
                }
            } catch (err) {
                showError('Không thể tải danh mục');
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
                productName: product.productName || '',
                description: product.description || '',
                Price: product.price || '',
                StockQuantity: product.stockQuantity || '',
                Status: product.status || '',
                categoryId: product.categoryId || '',
                Thumbnail: product.thumbnail,
                ProductImages: product.imageListJson
                    ? product.imageListJson.split(';').map((url: string) => ({ url }))
                    : [],
            });
        }
    }, [data]);

    const fields: Field[] = [
        { name: 'Id', type: 'hidden' },
        { name: 'productName', label: 'Tên sản phẩm', type: 'text' },
        { name: 'description', label: 'Mô tả', type: 'text' },
        { name: 'Price', label: 'Giá', type: 'number' },
        { name: 'StockQuantity', label: 'Tồn kho', type: 'number' },
        {
            name: 'Status',
            label: 'Trạng thái',
            type: 'select',
            options: [
                { label: 'Hoạt động', value: 'active' },
                { label: 'Ngừng bán', value: 'inactive' },
                { label: 'Hết hàng', value: 'out_of_stock' },
            ],
        },
        {
            name: 'categoryId',
            label: 'Danh mục',
            type: 'select',
            options: categoryOptions,
            rules: [{ required: true, message: 'Vui lòng chọn danh mục' }],
        },
        {
            name: 'Thumbnail',
            label: 'Ảnh đại diện',
            type: 'file',
        },
        {
            name: 'ProductImages',
            label: 'Ảnh chi tiết (có thể chọn nhiều)',
            type: 'file',
        }
    ];

    const handleSubmit = (values: any) => {
        setLoadingSubmit(true);
        const formData = new FormData();

        formData.append('productName', values.productName);
        formData.append('description', values.description);
        formData.append('Price', values.Price.toString());
        formData.append('StockQuantity', values.StockQuantity.toString());
        formData.append('Status', values.Status);
        formData.append('categoryId', values.categoryId);

        if (values.Thumbnail?.file instanceof File) {
            formData.append('Thumbnail', values.Thumbnail.file);
        }

        if (Array.isArray(values.productImages)) {
            values.productImages.forEach((imgWrapper: any) => {
                if (imgWrapper.file instanceof File) {
                    formData.append('productImages', imgWrapper.file);
                }
            });
        }


        updateProduct(values.Id, formData)
            .then((res) => {
                if (res.data) {
                    showSuccess('Cập nhật sản phẩm thành công');
                    navigate('/seller/products');
                } else {
                    message.error(res.data.message || 'Cập nhật sản phẩm thất bại');
                }
            })
            .catch(() => {
                message.error('Đã xảy ra lỗi khi cập nhật sản phẩm');
            })
            .finally(() => {
                setLoadingSubmit(false);
            });
    };

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>Cập nhật sản phẩm</h2>
            {!isLoading ? (
                <DynamicForm
                    formRef={formRef}
                    fields={fields}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitText="Cập nhật"
                    isEdit
                    loading={loadingSubmit}
                />
            ) : (
                <Flex justify="center" style={{ marginTop: '5%' }}>
                    <Spin />
                </Flex>
            )}
        </div>
    );
}
