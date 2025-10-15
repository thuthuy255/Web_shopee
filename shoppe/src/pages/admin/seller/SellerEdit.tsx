import React, { useEffect, useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Flex, message, Spin } from 'antd';
import { useGetDetailSellerQuery } from '../../../api/seller/seller.query';
import { updateSeller } from '../../../api/seller/seller.api';
import { showError, showSuccess } from '../../../untils/ShowToast';

export default function SellerEdit() {
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const formRef = useRef<any>(null);
    const navigate = useNavigate();

    const { data, isLoading } = useGetDetailSellerQuery({ params: id });

    const fields: Field[] = [
        { name: 'id', type: 'hidden' },
        { name: 'fullName', label: 'Tên cửa hàng', type: 'text', fullWidth: false },
        { name: 'username', label: 'Tên người bán', type: 'text', fullWidth: false },
        { name: 'email', label: 'Email', type: 'email', fullWidth: false },
        { name: 'phone', label: 'Số điện thoại', type: 'text', fullWidth: false },
        {
            name: 'isLocked',
            label: 'Trạng thái',
            type: 'select',
            fullWidth: false,
            options: [
                { label: 'Hoạt động', value: false },
                { label: 'Bị khoá', value: true },
            ],
        },
        // {
        //     name: 'avatar',
        //     label: 'Ảnh đại diện',
        //     type: 'file',
        //     fullWidth: false,
        // }
    ];

    useEffect(() => {
        if (data?.data) {
            const user = data.data;
            setInitialValues({
                id: user?.id,
                fullName: user?.fullName || '',
                username: user?.username || '',
                email: user?.email || '',
                phone: user?.phone || '',
                isLocked: user?.isLocked ?? false,
                // avatar: user?.avatar ? { url: user.avatar } : null, // ✅ preview ảnh nếu có
            });
        }
    }, [data]);

    const handleSubmit = (values: any) => {
        // setLoadingSubmit(true);
        const formData = new FormData();

        formData.append('Id', values.id); // 🔥 phải có để backend biết user nào cần update
        formData.append('FullName', values.fullName);
        formData.append('Username', values.username);
        formData.append('Email', values.email);
        formData.append('Phone', values.phone);
        formData.append('IsLocked', values.isLocked);

        if (values.avatar?.file instanceof File) {
            formData.append('Avatar', values.avatar.file);
        }

        updateSeller(formData)
            .then((res) => {
                if (res.data) {
                    showSuccess('Cập nhật người bán thành công');
                    navigate('/admin/seller');
                } else {
                    showError(res.data.error || 'Cập nhật thất bại');
                }
            })
            .catch((res: any) => {
                showError(res?.error);
            })
        // .finally(() => {
        //     setLoadingSubmit(false);
        // });
    };

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>Cập nhật người bán</h2>
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
