import React, { useRef, useState } from 'react';
import DynamicForm, { type Field } from '../../../components/DynamicForm';
import { showError, showSuccess } from '../../../untils/ShowToast';
import { useNavigate } from 'react-router-dom';
import { createPromotion } from '../../../api/promotion/promotion.api';
import dayjs from 'dayjs';

export default function PromotionCreate() {
    const formRef = useRef<any>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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




    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            await createPromotion(values);
            showSuccess('Tạo mã giảm giá thành công');
            formRef.current?.resetFields(); // ✅
            navigate('/admin/promotions')
        } catch (error) {
            showError('Tạo mã giảm giá thất bại');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>🛒 Thêm mã giảm giá mới</h2>
            <DynamicForm
                fields={fields}
                onSubmit={handleSubmit}
                formRef={formRef}
                loading={loading}
                submitText="Thêm mã giảm giá"
            />
        </div>
    );
}
