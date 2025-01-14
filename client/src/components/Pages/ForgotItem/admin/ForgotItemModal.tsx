import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Button, message, DatePicker, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IForgot } from "@/types/forgot-item";
import { IBuilding, IRoom } from "@/types/location";
import { useNotificationStore } from "@/stores/notification.store";
import BuildingService from "@/services/building.service";
import RoomService from "@/services/room.service";
import dayjs from "dayjs";
import TableService from "@/services/table.service";
import { IItem } from "@/types/item";

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
    const [buildings, setBuildings] = useState<IBuilding[]>([]);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [tables, setTables] = useState<IItem[]>([]);

    const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | undefined>(undefined);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>(undefined);
    const [selectedTable, setSelectedTable] = useState<IItem | undefined>(undefined);

    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        doSearchBuildings()
    }, [])

    useEffect(() => {
        if (selectedBuilding) {
            setRooms([])
            doSearchRooms(selectedBuilding.building_id)
            setSelectedRoom(undefined)
        }
    }, [selectedBuilding])

    useEffect(() => {
        if (selectedRoom) {
            doSearchItems()
        }
    }, [selectedRoom])

    useEffect(() => {
        if (editingItem) {
            console.log("Date", editingItem)
            form.setFieldsValue({
                ...editingItem,
                date: editingItem.date ? dayjs(editingItem.date) : null,
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

    const doSearchItems = async () => {
        try {
            const data = await TableService.findByRoomId(selectedRoom?.room_id || '');
            setTables(data || []);
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doSearchBuildings = async () => {
        try {
            const data = await BuildingService.findAll();
            setBuildings(data || []);
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doSearchRooms = async (buildingId: string) => {
        try {
            const data = await RoomService.findByBuildingId(buildingId);
            setRooms(() => data);
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doSubmit = () => {
        form
            .validateFields()
            .then((values) => {
                onSave({ ...values, date: values.date?.toDate().toISOString() });
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validation Failed:", info);
            });
    };

    const handleBuildingChange = (value: string) => {
        const building = buildings.find(b => b.building_name === value);
        if (building) {
            setSelectedBuilding(building);
        }
    }

    const handleRoomChange = (value: string) => {
        const room = rooms.find(r => `${r.room_name}` === value);
        if (room) {
            setSelectedRoom(room);
        }
    }

    return (
        <Modal
            title={editingItem ? "Edit Forgot Item" : "Add Forgot Item"}
            open={visible}
            onOk={doSubmit}
            onCancel={onCancel}
        >
            <Form form={form} layout="vertical">
                {/* Hidden ItemID */}
                <Form.Item
                    name="id"
                    hidden
                >
                    <Input value={editingItem?.id} />
                </Form.Item>
                <Form.Item
                    name="building_name"
                    label="Building Name"
                    rules={[{ required: true, message: "Please enter the building name" }]}
                >
                    <Select
                        placeholder="Select Building"
                        style={{ width: '100%' }}
                        value={selectedBuilding ? selectedBuilding.building_name : undefined}
                        onChange={handleBuildingChange}
                    >
                        {buildings.map(building => (
                            <Select.Option key={building.building_id} value={building.building_name}>
                                {building.building_name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="room_name"
                    label="Room Name"
                    rules={[{ required: true, message: "Please enter the room name" }]}
                >
                    <Select
                        placeholder="Select Building"
                        style={{ width: '100%' }}
                        value={selectedRoom ? selectedRoom.room_name : undefined}
                        onChange={handleRoomChange}
                    >
                        {rooms.map(room => (
                            <Select.Option key={room.room_name} value={room.room_name}>
                                {room.room_name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="table_id"
                    label="Table ID"
                    rules={[{ required: true, message: "Please enter the table ID" }]}
                >
                    <Select
                        placeholder="Select Table"
                        style={{ width: '100%' }}
                        value={selectedTable ? selectedTable.name : undefined}
                        onChange={handleRoomChange}
                    >
                        {tables.map(table => (
                            <Select.Option key={table.item_id} value={table.item_id}>
                                {table.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="date"
                    label="Date"
                    rules={[{ required: true, message: "Please select the date" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
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
