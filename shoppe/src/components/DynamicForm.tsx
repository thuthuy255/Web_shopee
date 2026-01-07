import React, { memo, useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  Upload,
  DatePicker,
  Space,
} from "antd";
import { FiUploadCloud } from "react-icons/fi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useNavigate } from "react-router-dom";
import { showWarning } from "../untils/ShowToast";

dayjs.extend(utc);

export interface Field {
  name: string;
  label?: string;
  type?:
  | "text"
  | "email"
  | "password"
  | "select"
  | "hidden"
  | "file"
  | "number"
  | "date";
  options?: { label: string; value: string | boolean }[];
  disabledDate?: (current: any) => boolean;
  onChange?: (value: any) => void;
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
  hideButtons?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  initialValues,
  onSubmit,
  isEdit,
  submitText,
  formRef,
  loading = false,
  hideButtons = false,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  /** 🔥 FileList state cho Upload */
  const [fileLists, setFileLists] = useState<Record<string, any[]>>({});

  /** 🔥 CHỐT: chỉ init form đúng 1 lần */
  const initializedRef = useRef(false);

  useEffect(() => {
    if (formRef) formRef.current = form;
  }, [formRef, form]);

  /* ================= INIT FORM (CHỈ 1 LẦN) ================= */
  useEffect(() => {
    if (!initialValues || initializedRef.current) return;

    const convertedValues: any = { ...initialValues };

    fields.forEach((field) => {
      /* ===== DATE ===== */
      if (field.type === "date" && initialValues[field.name]) {
        const raw = initialValues[field.name];
        convertedValues[field.name] =
          typeof raw === "string" && raw.includes("T")
            ? dayjs.utc(raw).local()
            : dayjs(raw, "YYYY-MM-DD");
      }

      /* ===== FILE ===== */
      if (field.type === "file") {
        const isMultiple = field.name === "ProductImages";
        const raw = initialValues[field.name];

        const list = isMultiple
          ? Array.isArray(raw)
            ? raw
            : []
          : raw
            ? [raw]
            : [];

        const fileList = list
          .filter(Boolean)
          .map((item: any, idx: number) => ({
            uid: item.uid || `init-${idx}`,
            name: item.name || `image-${idx}`,
            status: "done",
            url: item.url || item,
          }));

        setFileLists((prev) => ({
          ...prev,
          [field.name]: fileList,
        }));

        // ⚠️ Quan trọng: set form value KHỚP Upload
        convertedValues[field.name] = isMultiple
          ? fileList
          : fileList[0];
      }
    });

    form.setFieldsValue(convertedValues);
    initializedRef.current = true;
  }, [initialValues, fields, form]);

  /* ================= RENDER FIELD ================= */
  const renderField = (field: Field) => {
    if (field.type === "hidden") return <Input type="hidden" />;

    switch (field.type) {
      case "select":
        return (
          <Select placeholder={`Chọn ${field.label}`}>
            {field.options?.map((opt) => (
              <Select.Option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        );

      case "password":
        return <Input.Password placeholder={`Nhập ${field.label}`} />;

      case "email":
        return <Input type="email" placeholder={`Nhập ${field.label}`} />;

      case "date":
        return (
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            allowClear
            disabledDate={field.disabledDate}
            onChange={(date) => field.onChange?.(date)}
          />
        );

      // case "file": {
      //   const isMultiple = field.name === "ProductImages";
      //   const fileListState = fileLists[field.name] || [];

      //   return (
      //     <Upload
      //       multiple={isMultiple}
      //       listType="picture"
      //       fileList={fileListState}
      //       beforeUpload={(file) => {
      //         const newFile = {
      //           uid: file.uid,
      //           name: file.name,
      //           status: "done",
      //           originFileObj: file,
      //           url: URL.createObjectURL(file),
      //         };

      //         const updatedList = isMultiple
      //           ? [...fileListState, newFile]
      //           : [newFile];

      //         setFileLists((prev) => ({
      //           ...prev,
      //           [field.name]: updatedList,
      //         }));

      //         form.setFieldsValue({
      //           [field.name]: isMultiple ? updatedList : newFile,
      //         });

      //         form.validateFields([field.name]);
      //         return false;
      //       }}
      //       onRemove={(file) => {
      //         const newList = fileListState.filter(
      //           (f) => f.uid !== file.uid
      //         );

      //         setFileLists((prev) => ({
      //           ...prev,
      //           [field.name]: newList,
      //         }));

      //         form.setFieldsValue({
      //           [field.name]: isMultiple ? newList : undefined,
      //         });

      //         form.validateFields([field.name]);
      //       }}
      //     >
      //       <Button icon={<FiUploadCloud />}>Chọn ảnh</Button>
      //     </Upload>
      //   );
      // }
      case "file": {
        const isMultiple = field.name === "ProductImages";
        const fileListState = fileLists[field.name] || [];

        return (
          <Upload
            multiple={isMultiple}
            listType="picture"
            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp" // ✅ CHỈ HIỂN THỊ ẢNH
            fileList={fileListState}
            beforeUpload={(file) => {
              const newFile = {
                uid: file.uid,
                name: file.name,
                status: "done",
                originFileObj: file,
                url: URL.createObjectURL(file),
              };

              const updatedList = isMultiple
                ? [...fileListState, newFile]
                : [newFile];

              setFileLists((prev) => ({
                ...prev,
                [field.name]: updatedList,
              }));

              form.setFieldsValue({
                [field.name]: isMultiple ? updatedList : newFile,
              });

              form.validateFields([field.name]);
              return false;
            }}
            onRemove={(file) => {
              const newList = fileListState.filter(
                (f) => f.uid !== file.uid
              );

              setFileLists((prev) => ({
                ...prev,
                [field.name]: newList,
              }));

              form.setFieldsValue({
                [field.name]: isMultiple ? newList : undefined,
              });

              form.validateFields([field.name]);
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

  /* ================= SUBMIT ================= */
  const handleFinish = (values: any) => {
    const processed = { ...values };

    fields.forEach((field) => {
      if (field.type === "date" && values[field.name]) {
        processed[field.name] = dayjs(values[field.name]).format("YYYY-MM-DD");
      }
    });

    onSubmit(processed);
  };

  return (
    <Card
      style={{
        margin: "auto",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Row gutter={16}>
          {fields.map((field) => (
            <Col
              key={field.name}
              span={field.fullWidth || field.type === "hidden" ? 24 : 12}
              style={{ display: field.type === "hidden" ? "none" : undefined }}
            >
              <Form.Item
                label={field.type !== "hidden" ? field.label : undefined}
                name={field.name}
                rules={
                  field.type === "hidden"
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

        {!hideButtons && (
          <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                {submitText || (isEdit ? "Cập nhật" : "Thêm mới")}
              </Button>

              <Button
                size="large"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        )}
      </Form>
    </Card>
  );
};

export default memo(DynamicForm);
