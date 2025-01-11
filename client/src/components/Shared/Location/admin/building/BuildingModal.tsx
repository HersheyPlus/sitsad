import React, { useEffect } from "react";
import { Modal, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IBuilding } from "@/types/location";

interface IProps {
    visible: boolean;
    editingBuilding: IBuilding | null;
    onCancel: () => void;
    onSave: (values: IBuilding) => void;
}

const BuildingModal: React.FC<IProps> = ({
    visible,
    editingBuilding,
    onCancel,
    onSave,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingBuilding) {
            form.setFieldsValue(editingBuilding);
        } else {
            form.resetFields();
        }
    }, [editingBuilding, form]);

    const uploadProps = {
        beforeUpload: (file: File) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
                message.error("You can only upload image files!");
            }
            return isImage || Upload.LIST_IGNORE;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange: (info: any) => {
            if (info.file.status === "done") {
                const url = URL.createObjectURL(info.file.originFileObj);
                form.setFieldValue("image", url);
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
                onSave(values);
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validation Failed:", info);
            });
    };

    return (
        <Modal
            title={editingBuilding ? "Edit Location" : "Add Location"}
            visible={visible}
            onOk={doSubmit}
            onCancel={onCancel}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="building_name"
                    label="Building Name"
                    rules={[{ required: true, message: "Please enter the title" }]}
                >
                    <Input placeholder="Enter title" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: "Please enter the description" }]}
                >
                    <Input.TextArea rows={3} placeholder="Enter description" />
                </Form.Item>
                <Form.Item
                    name="image"
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

export default BuildingModal;
