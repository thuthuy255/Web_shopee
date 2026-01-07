import React, { useEffect, useRef, useState, useCallback } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { useNavigate } from 'react-router-dom';
import { createCategory, getAllCategories } from '../../../api/category/category.api';

export default function CategoryCreate() {
    const formRef = useRef<any>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentPage] = useState(1);
    const [pageSize] = useState(10);

    const [fields, setFields] = useState<Field[]>([
        {
            name: 'name',
            label: 'Tên danh mục',
            type: 'text',
            rules: [{ required: true, message: 'Vui lòng nhập tên danh mục' }],
        },
        {
            name: 'description',
            label: 'Mô tả',
            type: 'text',
            rules: [{ required: true, message: 'Vui lòng nhập mô tả' }],
        },
        {
            name: 'imageFile',
            label: 'Ảnh danh mục',
            type: 'file',
            rules: [{ required: true, message: 'Vui lòng chọn ảnh' }],
        },
        {
            name: 'parentCategoryId',
            label: 'Danh mục cha',
            type: 'select',
            rules: [],
            options: [], // Sẽ được cập nhật từ API
        },
    ]);

    // 🔄 Load danh mục cha
    const fetchCategories = useCallback(async () => {
        try {
            const body = {
                pageInfo: {
                    page: currentPage,
                    pageSize: pageSize,
                },
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
                // Thêm một option mặc định nếu cần
                options.unshift({ label: '-- Không chọn --', value: '' });
                setFields((prev) =>
                    prev.map((field) =>
                        field.name === 'parentCategoryId'
                            ? { ...field, options }
                            : field
                    )
                );
            }
        } catch (err) {
            console.error('Lỗi khi load danh mục cha:', err);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description);
            if (values.parentCategoryId) {
                formData.append('parentCategoryId', values.parentCategoryId);
            }

            if (values.imageFile?.file instanceof File) {
                formData.append('imageFile', values.imageFile.file);
            }
            await createCategory(formData);
            showSuccess('Thêm danh mục thành công');
            navigate('/seller/category');
        } catch (error) {
            showError('Lỗi khi thêm danh mục');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Thêm danh mục</h2>
            <DynamicForm
                fields={fields}
                onSubmit={handleSubmit}
                formRef={formRef}
                loading={loading}
            />
        </div>
    );
}
