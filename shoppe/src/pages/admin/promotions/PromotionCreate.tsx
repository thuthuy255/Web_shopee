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

        {
            name: 'code',
            label: 'Mã khuyến mãi',
            type: 'text',
            rules: [{ required: true, message: 'Vui lòng nhập mã khuyến mãi' }],
        },
        {
            name: 'description',
            label: 'Mô tả khuyến mãi',
            type: 'text',
            rules: [{ required: true, message: 'Vui lòng nhập mô tả' }],
        },
        {
            name: 'discountPercent',
            label: 'Phần trăm giảm (%)',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập phần trăm giảm' },
                { pattern: /^[0-9]+$/, message: 'Phần trăm phải là số' },
                {
                    validator: (_: any, value: any) => {
                        const num = parseInt(value);
                        if (value && (num < 1 || num > 100)) {
                            return Promise.reject('DiscountPercent phải từ 1 đến 100');
                        }
                        return Promise.resolve();
                    }
                }
            ],
        },
        {
            name: 'minOrderValue',
            label: 'Giá trị đơn hàng tối thiểu',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập giá trị tối thiểu' },
                { pattern: /^[0-9]+$/, message: 'Giá trị phải là số' },
            ],
        },
        {
            name: 'quantityLimit',
            label: 'Số lượng mã tối đa',
            type: 'text',
            rules: [
                { required: true, message: 'Vui lòng nhập số lượng mã' },
                { pattern: /^[0-9]+$/, message: 'Số lượng phải là số' },
            ],
        },
        {
            name: 'startDate',
            label: 'Ngày bắt đầu',
            type: 'date',
            rules: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }],
            disabledDate: (current) => {
                // ❌ không cho chọn ngày trước hôm nay
                return current && current.isBefore(dayjs().startOf('day'));
            },
        },
        {
            name: 'endDate',
            label: 'Ngày kết thúc',
            type: 'date',
            rules: [{ required: true, message: 'Vui lòng chọn ngày kết thúc' }],
            disabledDate: (current) => {
                const startDate = formRef.current?.getFieldValue('startDate');

                // ❌ không cho chọn ngày trước hôm nay
                if (current && current.isBefore(dayjs().startOf('day'))) {
                    return true;
                }

                // ❌ không cho nhỏ hơn startDate
                if (startDate && current.isBefore(startDate, 'day')) {
                    return true;
                }

                return false;
            },
        },



        {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
                { label: 'Đang hoạt động', value: 'Active' },
                { label: 'Ngừng hoạt động', value: 'Inactive' },
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
