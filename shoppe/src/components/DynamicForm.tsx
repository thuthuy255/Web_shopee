import React, { memo, use, useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Upload, DatePicker, Space } from 'antd';
import { FiUploadCloud } from 'react-icons/fi';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

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
    // state quản lý file list cho tất cả field file
    const [fileLists, setFileLists] = useState<Record<string, any[]>>({});

    useEffect(() => {
        if (formRef) formRef.current = form;
    }, [formRef, form]);

    useEffect(() => {
        if (initialValues) {
            const convertedValues = { ...initialValues };
            fields.forEach((field) => {
                if (field.type === 'date' && initialValues[field.name]) {
                    convertedValues[field.name] = moment(initialValues[field.name]);
                }

                // khởi tạo fileList state từ initialValues nếu field type=file
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
                return <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />;
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
                                originFileObj: file,  // giữ file gốc
                                url: URL.createObjectURL(file),
                            };

                            const updatedList = isMultiple ? [...fileListState, newFile] : [newFile];
                            setFileLists((prev) => ({ ...prev, [field.name]: updatedList }));

                            // cập nhật form
                            form.setFieldsValue({ [field.name]: isMultiple ? updatedList : newFile });

                            return false; // chặn upload tự động
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
                processed[field.name] = values[field.name].toISOString();
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
