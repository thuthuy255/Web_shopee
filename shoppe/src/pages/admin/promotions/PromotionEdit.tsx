import React, { useEffect, useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Flex, message, Spin } from 'antd';
import { showSuccess } from '../../../untils/ShowToast';
import { useGetDetailPromotionQuery } from '../../../api/promotion/promotion.query';
import { updatePromotion } from '../../../api/promotion/promotion.api';

export default function PromotionEdit() {
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const formRef = useRef<any>(null);
    const navigate = useNavigate();

    const { data, isLoading } = useGetDetailPromotionQuery({
        params: id,
    });

    const fields: Field[] = [
        { name: 'id', type: 'hidden' },
        { name: 'userId', type: 'hidden' },

        {
            name: 'code',
            label: 'Mã khuyến mãi',
            type: 'text',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng nhập mã khuyến mãi' }],
        },
        {
            name: 'description',
            label: 'Mô tả',
            type: 'text',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng nhập mô tả' }],
        },
        {
            name: 'discountPercent',
            label: 'Phần trăm giảm giá',
            type: 'number',
            fullWidth: false,
            rules: [
                { required: true, message: 'Vui lòng nhập phần trăm giảm' },
                { type: 'number', min: 1, max: 100, message: 'Giá trị từ 1 đến 100' },
            ],
        },
        {
            name: 'minOrderValue',
            label: 'Giá trị đơn tối thiểu',
            type: 'number',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' }],
        },
        {
            name: 'quantityLimit',
            label: 'Số lượng giới hạn',
            type: 'number',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng nhập số lượng giới hạn' }],
        },
        {
            name: 'startDate',
            label: 'Ngày bắt đầu',
            type: 'date',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }],
        },
        {
            name: 'endDate',
            label: 'Ngày kết thúc',
            type: 'date',
            fullWidth: false,
            rules: [{ required: true, message: 'Vui lòng chọn ngày kết thúc' }],
        },
        {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            fullWidth: false,
            options: [
                { label: 'Hoạt động', value: 'Active' },
                { label: 'Ngừng áp dụng', value: 'Inactive' },
            ],
            rules: [{ required: true, message: 'Vui lòng chọn trạng thái' }],
        },

    ];


    useEffect(() => {
        if (data?.data) {
            const promotion = data.data;
            setInitialValues({
                id: promotion.id,
                userId: promotion.userId,
                code: promotion.code || '',
                description: promotion.description || '',
                discountPercent: promotion.discountPercent || 0,
                minOrderValue: promotion.minOrderValue || 0,
                quantityLimit: promotion.quantityLimit || 0,
                startDate: promotion.startDate,
                endDate: promotion.endDate,
                status: promotion.status || 'Active',
            });
        }
    }, [data]);


    const handleSubmit = (values: any) => {
        // setLoadingSubmit(true);

        // Nếu có chọn Date, cần convert thành ISO string
        const body = {
            ...values,
            startDate: values.startDate?.toISOString?.() || values.startDate,
            endDate: values.endDate?.toISOString?.() || values.endDate,
        };

        updatePromotion(body)
            .then((res) => {
                if (res?.data) {
                    showSuccess("Cập nhật mã khuyến mãi thành công");
                    navigate('/admin/promotions');
                } else {
                    message.error(res.data?.message || 'Cập nhật mã khuyến mãi thất bại');
                }
            })
            .catch(() => {
                message.error('Đã xảy ra lỗi khi cập nhật');
            })
        // .finally(() => {
        //     setLoadingSubmit(false);
        // });
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
                <Flex justify='center' style={{ marginTop: '5%' }}>
                    <Spin />
                </Flex>
            )}
        </div>
    );
}
