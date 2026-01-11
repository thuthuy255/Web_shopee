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
        { name: 'sellerId', type: 'hidden' },

        // ===== CODE =====
        {
            name: 'code',
            label: 'Mã khuyến mãi',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập mã khuyến mãi' },
                { max: 50, message: 'Mã khuyến mãi tối đa 50 ký tự' }
            ],
        },

        // ===== DESCRIPTION =====
        {
            name: 'description',
            label: 'Mô tả khuyến mãi',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập mô tả' },
                { max: 255, message: 'Mô tả tối đa 255 ký tự' }
            ],
        },

        // ===== DISCOUNT PERCENT (decimal 5,2) =====
        {
            name: 'discountPercent',
            label: 'Phần trăm giảm giá',
            type: 'number',
            rules: [
                { required: true, message: 'Vui lòng nhập phần trăm giảm' },
                {
                    validator: (_: any, value: any) => {
                        if (value === null || value === undefined || value === '') {
                            return Promise.resolve(); // 🔥 chỉ required báo lỗi
                        }

                        const num = Number(value);

                        if (isNaN(num)) {
                            return Promise.reject('Giá trị phải là số');
                        }

                        if (num < 1 || num > 100) {
                            return Promise.reject('Phần trăm giảm phải từ 1 đến 100');
                        }

                        if (!/^\d{1,3}(\.\d{1,2})?$/.test(String(value))) {
                            return Promise.reject('Tối đa 2 chữ số thập phân');
                        }

                        return Promise.resolve();
                    }
                }
            ],
        },

        // ===== MIN ORDER VALUE (decimal 18,2) =====
        {
            name: 'minOrderValue',
            label: 'Giá trị đơn tối thiểu',
            type: 'number',
            rules: [
                { required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' },
                {
                    validator: (_: any, value: any) => {
                        if (value === null || value === undefined || value === '') {
                            return Promise.resolve();
                        }

                        const num = Number(value);

                        if (isNaN(num) || num < 0) {
                            return Promise.reject('Giá trị phải ≥ 0');
                        }

                        if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
                            return Promise.reject('Tối đa 2 chữ số thập phân');
                        }

                        return Promise.resolve();
                    }
                }
            ],
        },

        // ===== QUANTITY LIMIT (int) =====
        {
            name: 'quantityLimit',
            label: 'Số lượng giới hạn',
            type: 'number',
            rules: [
                { required: true, message: 'Vui lòng nhập số lượng giới hạn' },
                {
                    validator: (_: any, value: any) => {
                        if (value === null || value === undefined || value === '') {
                            return Promise.resolve();
                        }

                        const num = Number(value);

                        if (!Number.isInteger(num) || num <= 0) {
                            return Promise.reject('Số lượng phải là số nguyên dương');
                        }

                        return Promise.resolve();
                    }
                }
            ],
        },

        // ===== START DATE =====
        {
            name: 'startDate',
            label: 'Ngày bắt đầu',
            type: 'date',
            rules: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }],
            disabledDate: (current) =>
                current && current.isBefore(dayjs().startOf('day')),
        },

        // ===== END DATE =====
        {
            name: 'endDate',
            label: 'Ngày kết thúc',
            type: 'date',
            rules: [{ required: true, message: 'Vui lòng chọn ngày kết thúc' }],
            disabledDate: (current) => {
                const startDate = formRef.current?.getFieldValue('startDate');

                if (current && current.isBefore(dayjs().startOf('day'))) {
                    return true;
                }

                if (startDate && current.isBefore(startDate, 'day')) {
                    return true;
                }

                return false;
            },
        },

        // ===== STATUS =====
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

                status: promotion.status == "Inactive" ? "Inactive" : "Active",
            });
        }
    }, [data]);

    const handleSubmit = (values: any) => {
        console.log("Xin chào ", values)
        setLoadingSubmit(true);

        const body = {
            ...values,
            startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
            endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
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
