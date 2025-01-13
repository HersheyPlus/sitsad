import { Table, Button } from "antd";
import { IBuilding, IRoom } from "@/types/location";
import { IDevice } from "@/types/device";
import { useState } from "react";
import WebUrlModal from "./WebUrlModal";

interface IProps {
    buildings: IBuilding[];
    rooms: IRoom[];
    data: IDevice[];
    onEdit: (record: IDevice) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const DeviceTable = ({
    data,
    onEdit,
    onDelete,
    onAdd,
    buildings,
    rooms,
}: IProps) => {
    const [selectedWebUrl, setSelectedWebUrl] = useState<string | null>(null);

    const doCloseModal = () => {
        setSelectedWebUrl(null);
    }

    const doShowWebUrl = (webUrl: string) => {
        setSelectedWebUrl(webUrl);
    }

    const columns = [
        {
            title: "ID",
            dataIndex: "device_id",
            key: "device_id",
        },
        {
            title: "Device Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "MQTT Topic",
            dataIndex: "topic",
            key: "topic",
        },
        {
            title: "Building",
            dataIndex: "building_id",
            key: "type",
            render: (buildingId: string) => {
                const building = buildings.find((b) => b.building_id === buildingId);
                return building ? building.building_name : "N/A";
            }
        },
        {
            title: "Room",
            dataIndex: "room_id",
            key: "type",
            render: (roomId: string) => {
                const room = rooms.find((r) => r.room_id === roomId);
                return room ? room.room_name : "N/A";
            }
        },
        {
            title: "Web URL",
            dataIndex: "webUrl",
            key: "webUrl",
            render: (webUrl: string, record: IDevice) => {
                if (record.type.toLocaleLowerCase() === 'camera') {
                    return <div onClick={() => doShowWebUrl(webUrl)} className="text-blue-500 cursor-pointer">
                        {webUrl}
                    </div>;
                } else {
                    return "N/A";
                }
            },
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: IDevice) => (
                <div className="space-x-2">
                    <Button type="link" onClick={() => onEdit(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger onClick={() => onDelete(record.device_id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Device Management</h1>
                <Button type="primary" onClick={onAdd}>
                    Add Device
                </Button>
            </div>
            <Table dataSource={data} columns={columns} rowKey="device_id" className="shadow-lg" />

            <WebUrlModal webUrl={selectedWebUrl || ""} isVisible={!!selectedWebUrl} onClose={doCloseModal} />
        </div>
    );
};

export default DeviceTable;
