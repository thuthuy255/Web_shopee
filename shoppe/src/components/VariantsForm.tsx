import React, { useState, useEffect, memo } from "react";
import { Button, Input, InputNumber, Upload, Image, Card, Row, Col, Space, Popconfirm, Form } from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { deleteVariant } from "../api/product/product.api";
import { showError, showWarning } from "../untils/ShowToast";

interface Variant {
    id?: string;
    variantName: string;
    variantValue: string;
    price: number;
    stockQuantity: number;
    imageFile?: File | null;
    imageUrl?: string;
    isDeleted?: boolean;
}

interface Props {
    value?: Variant[];
    onChange?: (val: Variant[]) => void;
}

function VariantsForm({ value = [], onChange }: Props) {
    const [variants, setVariants] = useState<Variant[]>(value);

    useEffect(() => {
        setVariants(value);
    }, [value]);

    const triggerChange = (list: Variant[]) => {
        setVariants(list);
        onChange?.(list);
    };

    const addVariant = () => {
        triggerChange([
            ...variants,
            { variantName: "", variantValue: "", price: 0, stockQuantity: 0 },
        ]);
    };

    const updateVariant = (index: number, key: keyof Variant, val: any) => {
        const newVariants = [...variants];
        (newVariants[index] as any)[key] = val;
        triggerChange(newVariants);
    };

    const removeVariant = async (index: number, id?: string) => {
        if (id) {
            try {
                await deleteVariant(id);
                triggerChange(variants.filter((_, i) => i !== index));
            } catch (error) {
                console.error("Xóa biến thể thất bại:", error);
            }
        } else {
            triggerChange(variants.filter((_, i) => i !== index));
        }
    };

    return (
        <div style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 16 }}>Biến thể sản phẩm</h3>

            <Space direction="vertical" style={{ width: "100%" }} size="large">
                {variants.filter(v => !v.isDeleted).map((v, index) => (
                    <Card
                        key={index}
                        title={`Biến thể ${index + 1}`}
                        extra={
                            <Popconfirm
                                title="Xóa biến thể này?"
                                onConfirm={() => removeVariant(index, v.id)}
                            >
                                <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        }
                    >
                        <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item label="Tên biến thể">
                                    <Input
                                        value={v.variantName}
                                        onChange={(e) =>
                                            updateVariant(index, "variantName", e.target.value)
                                        }
                                        placeholder="VD: Màu sắc"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Giá trị">
                                    <Input
                                        value={v.variantValue}
                                        onChange={(e) =>
                                            updateVariant(index, "variantValue", e.target.value)
                                        }
                                        placeholder="VD: Đỏ"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Giá">
                                    <InputNumber
                                        min={0}
                                        value={v.price}
                                        onChange={(val) => updateVariant(index, "price", val || 0)}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Số lượng">
                                    <InputNumber
                                        min={0}
                                        value={v.stockQuantity}
                                        onChange={(val) =>
                                            updateVariant(index, "stockQuantity", val || 0)
                                        }
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Ảnh biến thể">
                                    <Upload
                                        listType="picture-card"
                                        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
                                        showUploadList={false}
                                        beforeUpload={(file) => {
                                            const isValidImage =
                                                file.type === "image/jpeg" ||
                                                file.type === "image/png" ||
                                                file.type === "image/gif" ||
                                                file.type === "image/webp" ||
                                                file.type === "image/bmp";

                                            if (!isValidImage) {
                                                showWarning(
                                                    "Chỉ được chọn ảnh (.jpg, .jpeg, .png, .gif, .webp, .bmp)"
                                                );
                                                return Upload.LIST_IGNORE; // ❌ KHÔNG cho vào list
                                            }

                                            updateVariant(index, "imageFile", file);
                                            return false; // không upload ngay
                                        }}
                                    >

                                        {v.imageUrl || v.imageFile ? (
                                            <div style={{ position: "relative" }}>
                                                <Image
                                                    src={
                                                        v.imageFile
                                                            ? URL.createObjectURL(v.imageFile)
                                                            : v.imageUrl
                                                    }
                                                    alt="variant"
                                                    width={80}
                                                    height={80}
                                                    style={{
                                                        objectFit: "cover",
                                                        borderRadius: 8,
                                                        display: "block",
                                                        margin: "0 auto",
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        background: "rgba(0,0,0,0.5)",
                                                        color: "#fff",
                                                        fontSize: 12,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Đổi ảnh
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>

                    </Card>
                ))}
            </Space>

            <Button
                type="dashed"
                onClick={addVariant}
                icon={<PlusOutlined />}
                style={{ marginTop: 16 }}
                block
            >
                Thêm biến thể
            </Button>
        </div>
    );
}

export default memo(VariantsForm);
