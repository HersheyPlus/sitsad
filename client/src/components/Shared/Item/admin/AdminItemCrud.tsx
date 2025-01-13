/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Card, Space, Input, Select, Button, Popconfirm } from "antd";
import { IItem, IItemPayload } from "@/types/item";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Filter from "./AdminItemCrudFilter";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { IBuilding, IRoom } from "@/types/location";
import { useNotificationStore } from "@/stores/notification.store";
import AdminItemCreateModal from "./AdminItemCreateModal";
import RoomService from "@/services/room.service";

dayjs.extend(isBetween);

interface IProps {
    data: IItem[];
    buildings: IBuilding[];
    itemType: string;
    onSaveItem: (data: IItem | IItemPayload, create: boolean) => void;
    onRemoveItem: (id: string) => void;
}

const AdminItemCrud = ({ data, buildings, itemType, onSaveItem, onRemoveItem }: IProps) => {
    const [filteredData, setFilteredData] = useState<IItem[]>(data);
    const [query, setQuery] = useState<string>("");
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [rooms, setRooms] = useState<IRoom[]>([]);

    const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | undefined>(undefined);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>(undefined);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        if (editingKey && rooms.length >= 0) {
            setSelectedRoom(rooms?.[0])
        }
    }, [selectedBuilding, rooms])

    useEffect(() => {
        if (selectedBuilding) {
            setRooms([])
            doSearchRooms(selectedBuilding.building_id)
        }

        setSelectedRoom(undefined)
    }, [selectedBuilding])

    useEffect(() => {
        if (editingKey) {
            const item = filteredData.find((item) => item.item_id === editingKey);
            if (item) {
                setSelectedBuilding(item.location.building);
                setSelectedRoom(item.location.room);
            }
        }
    }, [editingKey])

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

    const doSearchRooms = async (buildingId: string) => {
        try {
            const data = await RoomService.findByKeywordAndItemType("", buildingId, itemType);
            setRooms(() => data);

            return data
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const enterEditMode = (key: string) => {
        setEditingKey(key);
        setSelectedBuilding(filteredData.find((item) => item.item_id === key)?.location.building);
        setSelectedRoom(filteredData.find((item) => item.item_id === key)?.location.room);
    };

    const doEdit = (key: React.Key, value: string | number | { building: IBuilding; room: IRoom } | undefined, column: string) => {
        const newData = [...filteredData];
        const index = newData.findIndex((item) => key === item.item_id);
        if (index > -1) {
            const editedTable = newData[index];
            // @ts-ignore
            editedTable[column] = value;
            setFilteredData(newData);
        }
    };

    const doCancel = () => {
        setEditingKey(null);
    };

    const doSave = (key: string | IItem | IItemPayload) => {
        setEditingKey(null);

        const editedItem = typeof key === "string" ? filteredData.find((item) => item.item_id === key) : key;

        if (!editedItem) return;

        console.log("Edited item", editedItem);

        try {
            onSaveItem(editedItem, false);
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
            title: "Building",
            dataIndex: ["location", "building"],
            key: "building",
            render: (building: IBuilding, record) => (
                <Select
                    style={{ width: "100%" }}
                    // value={building.building_id}
                    value={record.item_id === editingKey ? selectedBuilding?.building_name : building.building_name}
                    onChange={(value) => {
                        const selectedBuilding = buildings.find((loc) => loc.building_id === value);
                        if (selectedBuilding) {
                            const newLocation = {
                                ...record.location,
                                building: selectedBuilding,
                            };

                            doEdit(record.item_id, newLocation, "location");
                        }

                        setSelectedBuilding(selectedBuilding);
                    }}
                    disabled={editingKey !== record.item_id.toString()}
                >
                    {
                        buildings.map((loc) => (
                            <Select.Option key={loc.building_id} value={loc.building_id}>
                                {loc.building_name}
                            </Select.Option>
                        ))
                    }
                </Select >
            ),
        },
        {
            title: "Room",
            dataIndex: ["location", "room"],
            key: "room",
            render: (room: IRoom, record) => (
                <Select
                    style={{ width: "100%" }}
                    value={record.item_id === editingKey ? selectedRoom?.room_name : room.room_name}
                    onChange={(value) => {
                        const selectedRoom = rooms.find((loc) => loc.room_id === value);
                        if (selectedRoom) {
                            const newLocation = {
                                ...record.location,
                                room: selectedRoom,
                            };
                            doEdit(record.item_id, newLocation, "location");
                            setSelectedRoom(selectedRoom);
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
                                onConfirm={() => onRemoveItem(record.item_id)}
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
                footer={() => (
                    <div style={{ textAlign: "right" }}>
                        <Button type="primary" onClick={() => setIsModalVisible(true)}>
                            Add new Item
                        </Button>
                    </div>
                )}
            />

            <AdminItemCreateModal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={(payload) => onSaveItem(payload, true)}
                buildings={buildings}
                itemType={itemType}
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
