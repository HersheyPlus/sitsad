import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { IBuilding, IRoom } from '@/types/location';
import { IItem, IItemPayload, ItemType } from '@/types/item';
import RoomService from '@/services/room.service';

interface IProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: IItemPayload | IItem) => void;
    buildings: IBuilding[];
    itemType: string;
    loading?: boolean;
}

const GRID_SIZE = 100

const AdminItemCreateModal: React.FC<IProps> = ({
    open,
    onCancel,
    onSubmit,
    buildings,
    itemType,
    loading = false,
}) => {
    const [form] = Form.useForm();
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (selectedBuilding) {
            setRooms([])
            doSearchRooms(selectedBuilding)
        }
    }, [selectedBuilding])

    const doSearchRooms = async (buildingId: string) => {
        if (selectedBuilding) {
            const data = await RoomService.findByBuildingId(buildingId);
            setRooms(data);
        }
    }

    const doSelectBuilding = (buildingId: string) => {
        setSelectedBuilding(buildingId)
    }

    const doSubmit = async () => {
        try {
            const values = await form.validateFields();
            // const selectedBuilding = buildings.find(b => b.building_id === values.building_id);
            // const selectedRoom = rooms.find(r => r.room_id === values.room_id);

            const payload: IItemPayload = {
                name: values.name,
                available: false,
                room_id: values.room_id,
                position_x: Math.floor(Math.random() * 5) * GRID_SIZE,
                position_y: Math.floor(Math.random() * 5) * GRID_SIZE,
                width: GRID_SIZE,
                height: GRID_SIZE,
                type: itemType === "toilet" ? ItemType.TOILET : ItemType.TABLE,
            }

            onSubmit(payload);
            onCancel();

            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const title = `Add New ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onCancel}
            onOk={doSubmit}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please input the name!' }]}
                >
                    <Input placeholder={`Enter ${itemType} name`} />
                </Form.Item>

                <Form.Item
                    name="building_id"
                    label="Building"
                    rules={[{ required: true, message: 'Please select a building!' }]}
                >
                    <Select
                        placeholder="Select building"
                        onChange={doSelectBuilding}
                        options={buildings.map(building => ({
                            label: building.building_name,
                            value: building.building_id,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="room_id"
                    label="Room"
                    rules={[{ required: true, message: 'Please select a room!' }]}
                >
                    <Select
                        placeholder="Select room"
                        options={rooms.map(room => ({
                            label: room.room_name,
                            value: room.room_id,
                        }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminItemCreateModal;