import React, { memo, useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Upload, DatePicker, Space } from 'antd';
import { FiUploadCloud } from 'react-icons/fi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useNavigate } from 'react-router-dom';

dayjs.extend(utc);

export interface Field {
    name: string;
    label?: string;
    type?: 'text' | 'email' | 'password' | 'select' | 'hidden' | 'file' | 'number' | 'date';
    options?: { label: string; value: string | boolean }[];
    rules?: any[];
    fullWidth?: boolean;
}

interface DynamicFormProps {
    fields: Field[];
    initialValues?: any;
    onSubmit: (values: any) => void;
    isEdit?: boolean;
    submitText?: string;
    formRef?: React.MutableRefObject<any>;
    loading?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
    fields,
    initialValues,
    onSubmit,
    isEdit,
    submitText,
    formRef,
    loading = false,
}) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [fileLists, setFileLists] = useState<Record<string, any[]>>({});

    useEffect(() => {
        if (formRef) formRef.current = form;
    }, [formRef, form]);

    useEffect(() => {
        if (initialValues) {
            const convertedValues = { ...initialValues };

            fields.forEach((field) => {
                // ✅ FIX phần DATE
                if (field.type === 'date' && initialValues[field.name]) {
                    const rawDate = initialValues[field.name];
                    if (typeof rawDate === 'string' && rawDate.includes('T')) {
                        // parse UTC để giữ nguyên ngày, không bị lệch múi giờ
                        convertedValues[field.name] = dayjs.utc(rawDate).local();
                    } else {
                        convertedValues[field.name] = dayjs(rawDate, 'YYYY-MM-DD');
                    }
                }

                // ✅ Khởi tạo file list nếu có field file
                if (field.type === 'file') {
                    const isMultiple = field.name === 'ProductImages';
                    const currentValueRaw = initialValues[field.name];
                    const currentValue = isMultiple
                        ? Array.isArray(currentValueRaw) ? currentValueRaw : []
                        : currentValueRaw ? [currentValueRaw] : [];

                    const list = currentValue
                        .filter(Boolean)
                        .map((item: any, idx: number) => {
                            if (typeof item === 'string') {
                                return { uid: idx, name: `image-${idx}`, status: 'done', url: item };
                            } else if (item.url) {
                                return { uid: item.uid || idx, name: item.name || `image-${idx}`, status: 'done', url: item.url };
                            } else if (item.file) {
                                return { uid: item.file.uid, name: item.file.name, status: 'done', originFileObj: item.file };
                            }
                            return null;
                        })
                        .filter(Boolean);

                    setFileLists(prev => ({ ...prev, [field.name]: list }));
                }
            });

            form.setFieldsValue(convertedValues);
        }
    }, [initialValues, fields, form]);

    const renderField = (field: Field) => {
        if (field.type === 'hidden') return <Input type="hidden" />;

        switch (field.type) {
            case 'select':
                return (
                    <Select placeholder={`Chọn ${field.label}`}>
                        {field.options?.map(opt => (
                            <Select.Option key={String(opt.value)} value={opt.value}>
                                {opt.label}
                            </Select.Option>
                        ))}
                    </Select>
                );
            case 'password':
                return <Input.Password placeholder={`Nhập ${field.label}`} />;
            case 'email':
                return <Input type="email" placeholder={`Nhập ${field.label}`} />;
            case 'date':
                return (
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        allowClear
                    />
                );
            case 'file': {
                const isMultiple = field.name === 'ProductImages';
                const fileListState = fileLists[field.name] || [];

                return (
                    <Upload
                        multiple={isMultiple}
                        listType="picture"
                        fileList={fileListState}
                        beforeUpload={(file) => {
                            const newFile = {
                                uid: file.uid,
                                name: file.name,
                                status: "done",
                                originFileObj: file,
                                url: URL.createObjectURL(file),
                            };

                            const updatedList = isMultiple ? [...fileListState, newFile] : [newFile];
                            setFileLists((prev) => ({ ...prev, [field.name]: updatedList }));
                            form.setFieldsValue({ [field.name]: isMultiple ? updatedList : newFile });

                            return false;
                        }}
                        onRemove={(fileToRemove) => {
                            const newList = fileListState.filter(f => f.uid !== fileToRemove.uid);
                            setFileLists(prev => ({ ...prev, [field.name]: newList }));
                            form.setFieldsValue({ [field.name]: isMultiple ? newList : null });
                        }}
                    >
                        <Button icon={<FiUploadCloud />}>Chọn ảnh</Button>
                    </Upload>
                );
            }
            default:
                return <Input placeholder={`Nhập ${field.label}`} />;
        }
    };

    const handleFinish = (values: any) => {
        const processed = { ...values };

        fields.forEach((field) => {
            if (field.type === 'date' && values[field.name]) {
                // giữ nguyên ngày theo local, không ép UTC
                processed[field.name] = dayjs(values[field.name]).format('YYYY-MM-DD');
            }
        });

        onSubmit(processed);
    };


    return (
        <Card style={{ margin: 'auto', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Form layout="vertical" form={form} onFinish={handleFinish} autoComplete="off" style={{ width: '100%' }}>
                <Row gutter={16}>
                    {fields.map(field => (
                        <Col
                            span={field.fullWidth || field.type === 'hidden' ? 24 : 12}
                            key={field.name}
                            style={{ display: field.type === 'hidden' ? 'none' : undefined }}
                        >
                            <Form.Item
                                label={field.type !== 'hidden' ? field.label : undefined}
                                name={field.name}
                                rules={
                                    field.type === 'hidden'
                                        ? []
                                        : field.rules || [{ required: true, message: `Vui lòng nhập ${field.label}` }]
                                }
                            >
                                {renderField(field)}
                            </Form.Item>
                        </Col>
                    ))}
                </Row>

                <Form.Item style={{ textAlign: 'center', marginTop: 32 }}>
                    <Space size="middle">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            style={{ minWidth: 160 }}
                        >
                            {submitText || (isEdit ? 'Cập nhật' : 'Thêm mới')}
                        </Button>

                        <Button
                            type="default"
                            size="large"
                            style={{ minWidth: 160 }}
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default memo(DynamicForm);
