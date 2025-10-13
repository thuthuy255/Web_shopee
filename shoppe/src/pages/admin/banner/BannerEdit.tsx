import React, { useEffect, useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Flex, message, Spin } from 'antd';
import { updateSeller } from '../../../api/seller/seller.api';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { useGetBannerDetailtQuery } from '../../../api/banner/banner.query';
import { updateBanner } from '../../../api/banner/banner.api';
import LoadingDefault from '../../../components/loading/LoadingDefault';

export default function BannerEdit() {
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const formRef = useRef<any>(null);
    const navigate = useNavigate();

    const { data, isLoading } = useGetBannerDetailtQuery({ params: id });

    const fields: Field[] = [
        { name: 'id', type: 'hidden' },
        {
            name: 'title',
            label: 'Tiêu đề',
            type: 'text',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng nhập tiêu đề banner' }]
        },
        {
            name: 'imageFile',
            label: 'Ảnh banner',
            type: 'file',
            fullWidth: false,
            rules: [{ required: false }]
        },
        {
            name: 'linkTo',
            label: 'Liên kết',
            type: 'text',
            fullWidth: false,
            rules: []
        },
        {
            name: 'type',
            label: 'Loại banner',
            type: 'text',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng chọn loại banner' }],
        },
        {
            name: 'isActive',
            label: 'Trạng thái',
            type: 'select',
            fullWidth: false,
            options: [
                { label: 'Hiển thị', value: true },
                { label: 'Ẩn', value: false },
            ],
            rules: [{ required: true, message: 'Vui lòng chọn trạng thái hiển thị' }]
        }
    ];

    useEffect(() => {
        if (data?.data) {
            const banner = data.data;
            setInitialValues({
                id: banner?.id,
                title: banner?.title || '',
                linkTo: banner?.linkTo || '',
                isActive: banner?.isActive ?? true,
                type: banner?.type || '',
                imageFile: banner?.imageUrl ? { url: banner.imageUrl } : null,
            });
        }
    }, [data]);


    const handleSubmit = (values: any) => {
        // setLoadingSubmit(true);
        const formData = new FormData();

        formData.append('Id', values.id);
        formData.append('Title', values.title);
        formData.append('LinkTo', values.linkTo);
        formData.append('type', values.type);
        formData.append('IsActive', values.isActive);

        if (values.imageFile?.file instanceof File) {
            formData.append('ImageFile', values.imageFile.file);
        }


        updateBanner(formData)
            .then((res) => {
                if (res.data) {
                    showSuccess('Cập nhật Banner thành công');
                    navigate('/admin/banner');
                } else {
                    showError(res.data.message || 'Cập nhật thất bại');
                }
            })
            .catch(() => {
                message.error('Có lỗi xảy ra khi cập nhật');
            })
        // .finally(() => {
        //     setLoadingSubmit(false);
        // });
    };

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>Cập nhật Banner</h2>
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
                    <LoadingDefault />
                </Flex>
            )}
        </div>
    );
}
