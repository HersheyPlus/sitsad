/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Card, Space, Input, Select, Button, Popconfirm } from "antd";
import { IItem } from "@/types/item";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Filter from "./AdminItemCrudFilter";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { IBuilding, IRoom } from "@/types/location";
import { useNotificationStore } from "@/stores/notification.store";

dayjs.extend(isBetween);

interface IProps {
    data: IItem[];
    buildings: IBuilding[];
    rooms: IRoom[];
    itemType: string;
    service: any;
}

const AdminItemCrud = ({ data, buildings, rooms, itemType, service }: IProps) => {
    const [filteredData, setFilteredData] = useState<IItem[]>(data);
    const [query, setQuery] = useState<string>("");
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const openNotification = useNotificationStore((state) => state.openNotification);

    useEffect(() => {
        setFilteredData(data);
    }, [data])

    // Apply the filter and update filteredData
    const doSearch = () => {
        const filtered = data.filter((item) => {
            const matchesTableId = item.item_id.toString().includes(query);
            const matchesTableName = item.name?.toLowerCase().includes(query.toLowerCase());
            return matchesTableId || matchesTableName;
        });
        setFilteredData(filtered);
    };

    const enterEditMode = (key: string) => {
        setEditingKey(key);
    };

    // Handle table data edit
    const doEdit = (key: React.Key, value: string | number | { building: IBuilding; room: IRoom } | undefined, column: string) => {
        const newData = [...filteredData];
        const index = newData.findIndex((item) => key === item.item_id);
        if (index > -1) {
            const editedTable = newData[index];
            editedTable[column] = value;
            setFilteredData(newData);
        }
    };

    const doCancel = () => {
        setEditingKey(null);
    };

    const doSave = (key: string) => {
        setEditingKey(null);

        const editedItem = filteredData.find((item) => item.item_id === key);

        if (!editedItem) return;

        try {
            service.update(editedItem);
            openNotification({
                message: "Item updated",
                description: "The item has been updated successfully.",
                type: "success",
            })

        } catch (error) {
            openNotification({
                message: "Error",
                description: "An error occurred while updating the item.",
                type: "error",
            })
            console.error(error);
        }

    };

    // Handle remove table
    const doRemove = (id: string) => {
        setFilteredData(filteredData.filter((item) => item.item_id !== id));
    };

    const idTitle = itemType.charAt(0).toUpperCase() + itemType.slice(1);

    const columns: ColumnsType<IItem> = [
        {
            title: `${idTitle} ID`,
            dataIndex: "item_id",
            key: "id",
            sorter: (a, b) => a.item_id.localeCompare(b.item_id),
            render: (text) => <span>{text}</span>,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <EditableCell
                    editable={editingKey === record.item_id.toString()}
                    value={text}
                    onChange={(value) => doEdit(record.item_id, value, "name")}
                />
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text, record) => (
                <EditableCell
                    editable={editingKey === record.item_id.toString()}
                    value={text}
                    onChange={(value) => doEdit(record.item_id, value, "description")}
                />
            ),
        },
        {
            title: "Building",
            dataIndex: ["location", "building"],
            key: "building",
            render: (building: IBuilding, record) => (
                <Select
                    style={{ width: "100%" }}
                    value={building.building_id}
                    onChange={(value) => {
                        const selectedBuilding = buildings.find((loc) => loc.building_id === value);
                        if (selectedBuilding) {
                            const newLocation = {
                                ...record.location,
                                building: selectedBuilding,
                            };
                            doEdit(record.item_id, newLocation, "location");
                        }
                    }}
                    disabled={editingKey !== record.item_id.toString()}
                >
                    {buildings.map((loc) => (
                        <Select.Option key={loc.building_id} value={loc.building_id}>
                            {loc.building_name}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Room",
            dataIndex: ["location", "room"],
            key: "room",
            render: (room: IRoom, record) => (
                <Select
                    style={{ width: "100%" }}
                    value={room.room_id}
                    onChange={(value) => {
                        const selectedRoom = rooms.find((loc) => loc.room_id === value);
                        if (selectedRoom) {
                            const newLocation = {
                                ...record.location,
                                room: selectedRoom,
                            };
                            doEdit(record.item_id, newLocation, "location");
                        }
                    }}
                    disabled={editingKey !== record.item_id.toString()}
                >
                    {rooms.map((loc) => (
                        <Select.Option key={loc.room_id} value={loc.room_id}>
                            {loc.room_name}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Status",
            dataIndex: "available",
            key: "available",
            render: (available) => {
                return (
                    <p className={available ? "font-bold text-green-400" : "font-bold text-red-400"}>
                        {available ? "Available" : "Occupied"}
                    </p>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    {editingKey === record.item_id.toString() ? (
                        <>
                            <Button type="link" onClick={() => doSave(record.item_id.toString())}>Save</Button>
                            <Button type="link" onClick={doCancel}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => enterEditMode(record.item_id.toString())}
                            />
                            <Popconfirm
                                title="Are you sure to delete this item?"
                                onConfirm={() => doRemove(record.item_id)}
                            >
                                <Button
                                    type="link"
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card
            style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px" }}
            title={
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5rem" }}>
                    <h2>{idTitle} Manager</h2>
                </div>
            }
        >
            <Filter doChangeQuery={setQuery} doSearch={doSearch} />
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="item_id"
                bordered
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                }}
            />
        </Card>
    );
};

interface EditableCellProps {
    editable: boolean;
    value: string | number;
    onChange: (value: string | number) => void;
}

const EditableCell = ({ editable, value, onChange }: EditableCellProps) => {
    return editable ? (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: "100%" }}
        />
    ) : (
        <span>{value}</span>
    );
};

export default AdminItemCrud;
