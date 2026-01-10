import React, { useEffect, useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { getCategoryOfSeller, updateCategory } from '../../../api/category/category.api';
import { showError, showSuccess, showWarning } from '../../../untils/ShowToast';
import { useGetDetailCategoryQuery } from '../../../api/category/category.query';
import LoadingDefault from '../../../components/loading/LoadingDefault';

export default function CategoryEdit() {
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
    const [isOptionsLoaded, setIsOptionsLoaded] = useState(false);
    const formRef = useRef<any>(null);
    const navigate = useNavigate();

    // Lấy chi tiết category
    const { data, isLoading } = useGetDetailCategoryQuery({ params: id });

    const fetchCategories = async () => {
        try {
            const body = {
                pageInfo: { page: 1, pageSize: 999999 },
                keyWord: '',
            };
            const res: any = await getCategoryOfSeller(body);

            if (res?.success && Array.isArray(res.data)) {
                const options = res.data.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                }));

                setCategoryOptions([{ label: 'Không có', value: '' }, ...options]);
                setIsOptionsLoaded(true); // ✅ Đánh dấu đã load xong
            }
        } catch (err) {
            showError('Không thể tải danh mục');
            console.error(err);
            setIsOptionsLoaded(true); // ✅ Vẫn cho phép hiển thị form
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ✅ CHỈ SET initialValues khi ĐÃ CÓ cả data VÀ categoryOptions
    useEffect(() => {
        if (data?.data && isOptionsLoaded) {
            const category = data.data;
            setInitialValues({
                id: category.id,
                name: category.name || '',
                description: category.description || '',
                parentCategoryId: category.parentCategoryId || '',
                imageUrl: category.imageUrl
                    ? {
                        url: category.imageUrl,
                        uid: 'thumb',
                        name: category.name,
                        status: 'done',
                    }
                    : null,
            });
        }
    }, [data, isOptionsLoaded]);

    const fields: Field[] = [
        { name: 'id', type: 'hidden' },
        { name: 'name', label: 'Tên danh mục', type: 'text' },
        { name: 'description', label: 'Mô tả', type: 'text' },
        {
            name: 'parentCategoryId',
            label: 'Danh mục cha',
            type: 'select',
            rules: [],
            options: categoryOptions, // ✅ Options đã được load đầy đủ
        },
        {
            name: 'imageUrl',
            label: 'Ảnh đại diện',
            type: 'file',
            rules: [{ required: true, message: 'Vui lòng chọn ảnh đại diện' }],
        },
    ];

    const handleSubmit = (values: any) => {
        const formData = new FormData();
        formData.append('Id', values.id);
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        formData.append('parentCategoryId', values.parentCategoryId || '');

        // Nếu user upload file mới
        if (values.imageUrl && values.imageUrl.originFileObj instanceof File) {
            formData.append('imageFile', values.imageUrl.originFileObj);
        }
        // Nếu giữ nguyên ảnh cũ (đã có url)
        else if (values.imageUrl && values.imageUrl.url) {
            // Không cần append gì, backend sẽ giữ nguyên
        }
        else {
            showWarning('Ảnh danh mục là bắt buộc');
            return;
        }

        updateCategory(values.id, formData)
            .then((res: any) => {
                if (res?.success) {
                    showSuccess(res?.message || 'Cập nhật danh mục thành công');
                    navigate('/seller/category');
                }
                else {
                    showWarning(res?.error || "Có lỗi xảy ra")
                }
            })
            .catch((e) => {
                showError(e);
                console.log("Có lỗi xảy ra");
            });
    };

    // ✅ CHỈ RENDER form khi đã load đủ cả data VÀ options
    const isReady = !isLoading && isOptionsLoaded && initialValues;

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>Cập nhật danh mục</h2>
            {isReady ? (
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
                    <LoadingDefault />
                </Flex>
            )}
        </div>
    );
}