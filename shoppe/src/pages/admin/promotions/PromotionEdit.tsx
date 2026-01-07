import React, { useEffect, useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Flex, message, Spin } from 'antd';
import { showSuccess } from '../../../untils/ShowToast';
import { useGetDetailPromotionQuery } from '../../../api/promotion/promotion.query';
import { updatePromotion } from '../../../api/promotion/promotion.api';
import dayjs from 'dayjs';

export default function PromotionEdit() {
    const { id } = useParams();
    const [initialValues, setInitialValues] = useState<any>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const formRef = useRef<any>(null);
    const navigate = useNavigate();

    const today = dayjs().startOf('day');

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
            rules: [{ required: true, message: 'Vui lòng nhập mã khuyến mãi' }],
        },
        {
            name: 'description',
            label: 'Mô tả',
            type: 'text',
            rules: [{ required: true, message: 'Vui lòng nhập mô tả' }],
        },
        {
            name: 'discountPercent',
            label: 'Phần trăm giảm giá',
            type: 'number',
            rules: [
                { required: true, message: 'Vui lòng nhập phần trăm giảm' },
                { type: 'number', min: 1, max: 100, message: 'Giá trị từ 1 đến 100' },
            ],
        },
        {
            name: 'minOrderValue',
            label: 'Giá trị đơn tối thiểu',
            type: 'number',
            rules: [{ required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' }],
        },
        {
            name: 'quantityLimit',
            label: 'Số lượng giới hạn',
            type: 'number',
            rules: [{ required: true, message: 'Vui lòng nhập số lượng giới hạn' }],
        },

        // ===== START DATE =====
        {
            name: 'startDate',
            label: 'Ngày bắt đầu',
            type: 'date',
            rules: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }],
            disabledDate: (current) => {
                const oldStartDate = formRef.current?.getFieldValue('startDate');

                // Nếu là ngày cũ → cho phép
                if (oldStartDate && dayjs(oldStartDate).isSame(current, 'day')) {
                    return false;
                }

                // Không cho chọn ngày quá khứ
                return current && current.isBefore(today);
            },
        },

        // ===== END DATE =====
        {
            name: 'endDate',
            label: 'Ngày kết thúc',
            type: 'date',
            rules: [{ required: true, message: 'Vui lòng chọn ngày kết thúc' }],
            disabledDate: (current) => {
                const startDate = formRef.current?.getFieldValue('startDate');
                const oldEndDate = formRef.current?.getFieldValue('endDate');

                // Cho giữ nguyên endDate cũ
                if (oldEndDate && dayjs(oldEndDate).isSame(current, 'day')) {
                    return false;
                }

                if (current && current.isBefore(today)) return true;

                if (startDate && current.isBefore(dayjs(startDate), 'day')) return true;

                return false;
            },
        },

        {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
                { label: 'Hoạt động', value: 'Active' },
                { label: 'Ngừng áp dụng', value: 'Inactive' },
            ],
            rules: [{ required: true, message: 'Vui lòng chọn trạng thái' }],
        },
    ];

    // ===== SET INITIAL VALUES =====
    useEffect(() => {
        if (data?.data) {
            const promotion = data.data;

            setInitialValues({
                id: promotion.id,
                userId: promotion.userId,
                code: promotion.code ?? '',
                description: promotion.description ?? '',
                discountPercent: promotion.discountPercent ?? 0,
                minOrderValue: promotion.minOrderValue ?? 0,
                quantityLimit: promotion.quantityLimit ?? 0,

                // ⚠️ BẮT BUỘC convert sang dayjs
                startDate: promotion.startDate ? dayjs(promotion.startDate) : null,
                endDate: promotion.endDate ? dayjs(promotion.endDate) : null,

                status: promotion.status ?? 'Active',
            });
        }
    }, [data]);

    const handleSubmit = (values: any) => {
        setLoadingSubmit(true);

        const body = {
            ...values,
            startDate: values.startDate?.toISOString(),
            endDate: values.endDate?.toISOString(),
        };

        updatePromotion(body)
            .then((res) => {
                if (res?.data) {
                    showSuccess('Cập nhật mã khuyến mãi thành công');
                    navigate('/admin/promotions');
                } else {
                    message.error(res.data?.message || 'Cập nhật thất bại');
                }
            })
            .catch(() => {
                message.error('Đã xảy ra lỗi khi cập nhật');
            })
            .finally(() => {
                setLoadingSubmit(false);
            });
    };

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>Cập nhật mã khuyến mãi</h2>

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
