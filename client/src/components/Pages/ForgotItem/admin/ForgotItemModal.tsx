import React, { useEffect } from "react";
import { Modal, Form, Input, Upload, Button, message, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IForgot } from "@/types/forgot-item";

interface IProps {
    visible: boolean;
    editingItem: IForgot | null;
    onCancel: () => void;
    onSave: (values: IForgot) => void;
}

const ForgotItemModal: React.FC<IProps> = ({
    visible,
    editingItem,
    onCancel,
    onSave,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingItem) {
            form.setFieldsValue({
                ...editingItem,
                date: editingItem.date ? new Date(editingItem.date) : null,
            });
        } else {
            form.resetFields();
        }
    }, [editingItem, form]);

    const uploadProps = {
        beforeUpload: (file: File) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
                message.error("You can only upload image files!");
            }
            return isImage || Upload.LIST_IGNORE;
        },
        onChange: (info: any) => {
            if (info.file.status === "done") {
                const url = URL.createObjectURL(info.file.originFileObj);
                form.setFieldValue("imageUrl", url);
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const doSubmit = () => {
        form
            .validateFields()
            .then((values) => {
                onSave({ ...values, date: values.date?.toISOString() });
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validation Failed:", info);
            });
    };

    return (
        <Modal
            title={editingItem ? "Edit Forgot Item" : "Add Forgot Item"}
            open={visible}
            onOk={doSubmit}
            onCancel={onCancel}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="building_name"
                    label="Building Name"
                    rules={[{ required: true, message: "Please enter the building name" }]}
                >
                    <Input placeholder="Enter building name" />
                </Form.Item>
                <Form.Item
                    name="room_name"
                    label="Room Name"
                    rules={[{ required: true, message: "Please enter the room name" }]}
                >
                    <Input placeholder="Enter room name" />
                </Form.Item>
                <Form.Item
                    name="date"
                    label="Date"
                    rules={[{ required: true, message: "Please select the date" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="tableId"
                    label="Table ID"
                    rules={[{ required: true, message: "Please enter the table ID" }]}
                >
                    <Input placeholder="Enter table ID" />
                </Form.Item>
                <Form.Item
                    name="imageUrl"
                    label="Image"
                >
                    <Upload {...uploadProps} listType="picture">
                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ForgotItemModal;
