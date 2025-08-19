import React, { useEffect } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Upload, DatePicker, Switch } from 'antd';
import { FiUploadCloud } from 'react-icons/fi';
import moment from 'moment';

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
            });
            form.setFieldsValue(convertedValues);
        }
    }, [initialValues, fields, form]);

    const renderField = (field: Field) => {
        if (field.type === 'hidden') {
            return <Input type="hidden" />;
        }

        switch (field.type) {
            case 'select':
                return (
                    <Select placeholder={`Chọn ${field.label}`}>
                        {field.options?.map((opt) => (
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
                const isMultiple = field.name === 'productImages';
                return (
                    <Upload
                        multiple={isMultiple}
                        listType="picture"
                        beforeUpload={(file) => {
                            const current = form.getFieldValue(field.name) || [];
                            const valueToSet = isMultiple
                                ? [...current, { file }]
                                : { file };
                            form.setFieldsValue({ [field.name]: valueToSet });
                            return false;
                        }}
                        onRemove={(fileToRemove) => {
                            if (isMultiple) {
                                const currentList = form.getFieldValue(field.name) || [];
                                const newList = currentList.filter(
                                    (item: any) => item.file.uid !== fileToRemove.uid
                                );
                                form.setFieldsValue({ [field.name]: newList });
                            } else {
                                form.setFieldsValue({ [field.name]: null });
                            }
                        }}
                        fileList={undefined}
                        maxCount={isMultiple ? undefined : 1}
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
        <Card
            style={{
                margin: 'auto',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={handleFinish}
                autoComplete="off"
                style={{ width: '100%' }}
            >
                <Row gutter={16}>
                    {fields.map((field) => (
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
                                        : field.rules || [
                                            {
                                                required: true,
                                                message: `Vui lòng nhập ${field.label}`,
                                            },
                                        ]
                                }
                            >
                                {renderField(field)}
                            </Form.Item>
                        </Col>
                    ))}
                </Row>

                <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
                    <Button type="primary" htmlType="submit" size="large" loading={loading} style={{ minWidth: 150 }}>
                        {submitText || (isEdit ? 'Cập nhật' : 'Thêm mới')}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default DynamicForm;
