import { useEffect, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import { IBuilding, IRoom } from "@/types/location";
import { DeviceType, IDevice } from "@/types/device";

interface IProps {
    visible: boolean;
    editingDevice: IDevice | null;
    onCancel: () => void;
    onSave: (values: IDevice) => void;
    buildings: IBuilding[];
    rooms: IRoom[];
}

const deviceTypes = Object.values(DeviceType);

const RoomModal = ({
    visible,
    buildings,
    rooms,
    editingDevice,
    onCancel,
    onSave,
}: IProps) => {
    const [form] = Form.useForm();
    const [selectedBuilding, setSelectedBuilding] = useState<string | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (editingDevice) {
            form.setFieldsValue(editingDevice); // Load the device's data into the form
            setSelectedBuilding(editingDevice.building_id); // Update selectedBuilding
            setSelectedType(editingDevice.type); // Update selectedType for conditional fields
        } else {
            form.resetFields();
            setSelectedBuilding(undefined);
            setSelectedType(undefined);
        }
    }, [editingDevice, form]);

    useEffect(() => {
        form.setFieldValue("room_id", undefined); // Reset room when building changes
    }, [selectedBuilding]);

    const doSelectBuilding = (value: string) => {
        setSelectedBuilding(value);
    };

    const doSelectType = (value: string) => {
        setSelectedType(value);
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
            title={editingDevice ? "Edit Device" : "Add Device"}
            visible={visible}
            onOk={doSubmit}
            onCancel={onCancel}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Device name"
                    rules={[{ required: true, message: "Please enter device name" }]}
                >
                    <Input placeholder="Enter device name" />
                </Form.Item>
                <Form.Item
                    name="building_id"
                    label="Building"
                    rules={[{ required: true, message: "Please select a building" }]}
                >
                    <Select placeholder="Select a building" onChange={doSelectBuilding}>
                        {buildings.map((building) => (
                            <Select.Option key={building.building_id} value={building.building_id}>
                                {building.building_name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="room_id"
                    label="Room"
                    rules={[{ required: true, message: "Please select a room" }]}
                >
                    <Select
                        placeholder="Select a room"
                        disabled={!selectedBuilding} // Only disable if no building is selected
                    >
                        {rooms
                            .filter((room) => room.building_id === selectedBuilding)
                            .map((room) => (
                                <Select.Option key={room.room_id} value={room.room_id}>
                                    {room.room_name}
                                </Select.Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Please select a type" }]}
                >
                    <Select placeholder="Select a type" onChange={doSelectType}>
                        {deviceTypes.map((type) => (
                            <Select.Option key={type} value={type}>
                                {type}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedType === DeviceType.Camera && (
                    <Form.Item
                        name="webUrl"
                        label="Web URL"
                        rules={[{ required: true, message: "Please enter web URL" }]}
                    >
                        <Input placeholder="Enter web URL" />
                    </Form.Item>
                )}

                {selectedType === DeviceType.Sensor && (
                    <Form.Item
                        name="topic"
                        label="MQTT Topic"
                        rules={[{ required: true, message: "Please enter MQTT topic" }]}
                    >
                        <Input placeholder="Enter MQTT topic" />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default RoomModal;
