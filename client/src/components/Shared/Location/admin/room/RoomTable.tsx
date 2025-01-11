import { Table, Button } from "antd";
import { IRoom } from "@/types/location";

interface LocationTableProps {
    data: IRoom[];
    onEdit: (record: IRoom) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const RoomTable: React.FC<LocationTableProps> = ({
    data,
    onEdit,
    onDelete,
    onAdd,
}) => {
    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            render: (text: string) => (
                <img src={text} alt="Location" className="object-cover w-16 h-16" />
            ),
        },
        {
            title: "Current",
            dataIndex: "current",
            key: "current",
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: IRoom) => (
                <div className="space-x-2">
                    <Button type="link" onClick={() => onEdit(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger onClick={() => onDelete(record.room_id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Location Management</h1>
                <Button type="primary" onClick={onAdd}>
                    Add Room
                </Button>
            </div>
            <Table dataSource={data} columns={columns} rowKey="id" className="shadow-lg" />
        </div>
    );
};

export default RoomTable;
