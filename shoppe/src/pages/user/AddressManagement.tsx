import React, { memo, useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Checkbox,
    message,
    Spin,
    Button,
    List,
    Tag,
    Divider,
    Typography,
    Empty,
    Radio,
} from "antd";
import {
    createAddress,
    updateAddress,
    deleteAddress,
    getUserAddresses,
} from "../../api/address/address.api";

const { Title, Text } = Typography;

interface Address {
    id: string;
    addressDetail: string;
    city: string;
    province: string;
    isDefault: boolean;
    fullName: string;
    phoneNumber: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSaved?: () => void;
    selectedId?: string | null; // id địa chỉ được chọn (cha quản lý)
    onSelect?: (id: string) => void; // callback khi chọn địa chỉ
}

const AddressManagement = ({ visible, onClose, onSaved, selectedId, onSelect }: Props) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [form] = Form.useForm();

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await getUserAddresses();
            setAddresses(res.data || []);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải địa chỉ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchAddresses();
            form.resetFields();
            setEditingAddress(null);
        }
    }, [visible]);

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        form.setFieldsValue(address);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAddress(id);
            message.success("Xóa địa chỉ thành công.");
            fetchAddresses();
        } catch (error) {
            console.error(error);
            message.error("Xóa địa chỉ thất bại.");
        }
    };

    const handleSetDefault = async (address: Address) => {
        try {
            await updateAddress({ ...address, isDefault: true });
            message.success("Đã đặt địa chỉ mặc định.");
            fetchAddresses();
        } catch (error) {
            console.error(error);
            message.error("Không thể đặt mặc định.");
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingAddress) {
                await updateAddress({ ...values, id: editingAddress.id });
                message.success("Cập nhật địa chỉ thành công.");
            } else {
                await createAddress(values);
                message.success("Thêm địa chỉ thành công.");
            }
            onClose();
            onSaved?.();
        } catch (error) {
            console.error(error);
            message.error("Thao tác thất bại.");
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={editingAddress ? "Cập nhật" : "Thêm mới"}
            width={700}
            style={{ top: 40 }}
        >
            {loading ? (
                <Spin />
            ) : (
                <div>
                    <Title level={5}>Danh sách địa chỉ</Title>
                    <Divider />

                    {addresses.length > 0 ? (
                        <Radio.Group
                            value={selectedId}
                            onChange={(e) => onSelect?.(e.target.value)}
                            style={{ width: "100%" }}
                        >
                            <List
                                dataSource={addresses}
                                renderItem={(addr) => (
                                    <List.Item
                                        style={{
                                            background: "#fafafa",
                                            borderRadius: 12,
                                            marginBottom: 12,
                                            padding: 16,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                        actions={[
                                            !addr.isDefault && (
                                                <Button type="link" onClick={() => handleSetDefault(addr)}>
                                                    Đặt mặc định
                                                </Button>
                                            ),
                                            <Button type="link" onClick={() => handleEdit(addr)}>
                                                Sửa
                                            </Button>,
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => handleDelete(addr.id)}
                                            >
                                                Xóa
                                            </Button>,
                                        ]}
                                    >
                                        <Radio value={addr.id} style={{ marginRight: 12 }} />

                                        <div style={{ flex: 1 }}>
                                            {addr.isDefault && (
                                                <Tag color="blue" style={{ marginRight: 8 }}>
                                                    Mặc định
                                                </Tag>
                                            )}
                                            <div>
                                                <Text strong>
                                                    {addr.fullName} - {addr.phoneNumber}
                                                </Text>
                                                <p style={{ marginBottom: 0 }}>{addr.addressDetail}</p>
                                                <div style={{ color: "rgba(0,0,0,0.45)" }}>
                                                    {addr.city}, {addr.province}
                                                </div>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Radio.Group>
                    ) : (
                        <Empty description="Chưa có địa chỉ nào" style={{ margin: "24px 0" }} />
                    )}

                    <Divider />

                    <Title level={5}>{editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</Title>
                    <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
                        <Form.Item
                            label="Họ và tên"
                            name="fullName"
                            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                        >
                            <Input placeholder="VD: Nguyễn Văn A" />
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            name="phoneNumber"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input placeholder="VD: 0987654321" />
                        </Form.Item>

                        <Form.Item
                            label="Địa chỉ chi tiết"
                            name="addressDetail"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết" }]}
                        >
                            <Input placeholder="VD: 123 Nguyễn Văn Cừ, phường 5" />
                        </Form.Item>

                        <Form.Item
                            label="Thành phố"
                            name="city"
                            rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
                        >
                            <Input placeholder="VD: Hà Nội" />
                        </Form.Item>

                        <Form.Item
                            label="Tỉnh/Thành"
                            name="province"
                            rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành" }]}
                        >
                            <Input placeholder="VD: Bắc Ninh" />
                        </Form.Item>

                        <Form.Item name="isDefault" valuePropName="checked">
                            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Modal>
    );
};

export default memo(AddressManagement);
