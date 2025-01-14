/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Card, Space, Input, Select, Button, Popconfirm } from "antd";
import { IItem, IItemPayload } from "@/types/item";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import Filter from "./AdminItemCrudFilter";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { IBuilding, IRoom } from "@/types/location";
import { useNotificationStore } from "@/stores/notification.store";
import AdminItemCreateModal from "./AdminItemCreateModal";
import RoomService from "@/services/room.service";
import ItemUtils from "@/utils/ItemUtils";
import { DeviceType, IDevice } from "@/types/device";
import DeviceService from "@/services/device.service";
import WebUrlModal from "../../Device/WebUrlModal";

dayjs.extend(isBetween);

interface IProps {
    data: IItem[];
    buildings: IBuilding[];
    itemType: string;
    onSaveItem: (data: IItemPayload, create: boolean) => void;
    onRemoveItem: (id: string) => void;
}

const AdminItemCrud = ({ data, buildings, itemType, onSaveItem, onRemoveItem }: IProps) => {
    const [filteredData, setFilteredData] = useState<IItem[]>(data);
    const [query, setQuery] = useState<string>("");
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [devices, setDevices] = useState<IDevice[]>([]);

    const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | undefined>(undefined);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>(undefined);
    const [selectedDevice, setSelectedDevice] = useState<IDevice | undefined>(undefined);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [webUrl, setWebUrl] = useState<string | undefined>(undefined);

    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        setFilteredData(data);
    }, [data])

    // useEffect(() => {
    //     if (editingKey && selectedBuilding && rooms.length >= 0) {
    //         const record = filteredData.find((item) => item.item_id === editingKey);

    //         if (!record) return;

    //         const room = rooms.filter((loc) => loc.building_id === selectedBuilding.building_id)[0];

    //         if (room) {
    //             const newLocation = {
    //                 ...record.location,
    //                 room,
    //             };
    //             doEdit(record.item_id, newLocation, "location");
    //             setSelectedRoom(room);
    //         }
    //     }
    // }, [selectedBuilding, rooms])

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

    useEffect(() => {
        doSearchDevices()
    }, [])

    // Apply the filter and update filteredData
    const doSearch = () => {
        const filtered = data.filter((item) => {
            const matchesTableId = item.item_id.toString().includes(query);
            const matchesTableName = item.name?.toLowerCase().includes(query.toLowerCase());
            return matchesTableId || matchesTableName;
        });
        setFilteredData(filtered);
    };

    const doSearchDevices = async () => {
        try {
            const data = await DeviceService.findAll();
            setDevices(() => data);

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

    const doSearchRooms = async (buildingId: string) => {
        try {
            const data = await RoomService.findByBuildingId(buildingId);
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

    const doEdit = (key: React.Key, value: string | number | IDevice | { building: IBuilding; room: IRoom } | undefined, column: string) => {
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

    const doSave = (key: string | IItemPayload) => {
        setEditingKey(null);

        const editedItem = typeof key === "string" ? filteredData.find((item) => item.item_id === key) : undefined;

        if (!editedItem) return;

        const payload = typeof key === "string" ? ItemUtils.convertToPayload(editedItem) : key;

        try {
            onSaveItem(payload, false);
            // window.location.reload();
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

        // Reload Page

    };

    const doShowWebUrlModal = (url: string) => {
        setWebUrl(url);
    }

    const doCloseWebUrlModal = () => {
        setWebUrl(undefined);
    }

    const idTitle = itemType.charAt(0).toUpperCase() + itemType.slice(1);

    const columns: ColumnsType<IItem> = [
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
            title: "Device",
            dataIndex: "device",
            key: "device",
            render: (device: IDevice, record) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Select
                        style={{ width: "100%" }}
                        value={record.item_id === editingKey ? selectedDevice?.device_id : device?.device_id}
                        onChange={(value) => {
                            const selectedDevice = devices.find((d) => d.device_id === value);
                            if (selectedDevice) {
                                doEdit(record.item_id, selectedDevice, "device");
                                setSelectedDevice(selectedDevice);
                            }
                        }}
                        disabled={editingKey !== record.item_id.toString()}
                    >
                        {devices.map((d) => (
                            <Select.Option key={d.device_id} value={d.device_id}>
                                {d.name}
                            </Select.Option>
                        ))}
                    </Select>
                    {
                        (device && device.type === DeviceType.Camera) && (
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => doShowWebUrlModal(device.webUrl)}
                                style={{ marginLeft: 8 }} // Space between Select and Button
                            />
                        )
                    }
                </div>
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

            <WebUrlModal
                webUrl={webUrl}
                isVisible={!!webUrl}
                onClose={doCloseWebUrlModal}
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
