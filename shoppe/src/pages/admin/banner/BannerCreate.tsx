import React, { useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { RegisterbyAdmin } from '../../../api/auth.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { useNavigate } from 'react-router-dom';
import { createBanner } from '../../../api/banner/banner.api';

export default function BannerCreate() {
    const formRef = useRef<any>(null); // ✅ khai báo đúng kiểu có thể null ban đầu
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const fields: Field[] = [
        {
            name: 'title',
            label: 'Tiêu đề',
            type: 'text',
            rules: [{ required: true, message: 'Vui lòng nhập tiêu đề banner' }]
        },
        {
            name: 'linkTo',
            label: 'Liên kết',
            type: 'text',
            rules: []
        },
        {
            name: 'type',
            label: 'Loại banner',
            type: 'text',
            rules: [{ required: true, message: 'Vui lòng chọn loại banner' }],

        },
        {
            name: 'imageFile',
            label: 'Ảnh banner',
            type: 'file',
            rules: [{ required: true, message: 'Vui lòng chọn ảnh' }]
        },
        {
            name: 'isActive',
            label: 'Hiển thị',
            type: 'select',
            rules: [{ required: true, message: 'Vui lòng chọn trạng thái' }],
            options: [
                { label: 'Hiển thị', value: true },
                { label: 'Ẩn', value: false }
            ]
        }

    ];

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', values?.title || '');
            formData.append('linkTo', values?.linkTo || '');
            formData.append('isActive', values?.isActive ? 'true' : 'false');
            formData.append('type', values?.type || '');

            if (values.imageFile?.file instanceof File) {
                formData.append('imageFile', values.imageFile.file);
            }
            await createBanner(formData);
            showSuccess('Thêm banner thành công');

            navigate('/admin/banner');
        } catch (error: any) {
            showError(error?.error);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Thêm Banner</h2>
            <DynamicForm fields={fields} onSubmit={handleSubmit} formRef={formRef} />
        </div>
    );
}
