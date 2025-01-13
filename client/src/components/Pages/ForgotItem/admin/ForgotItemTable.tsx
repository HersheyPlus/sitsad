import { IForgot } from "@/types/forgot-item";
import { Table, Button } from "antd";

interface IProps {
    data: IForgot[];
    onEdit: (record: IForgot) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const ForgotTable: React.FC<IProps> = ({
    data,
    onEdit,
    onDelete,
    onAdd,
}) => {
    const columns = [
        {
            title: "Building Name",
            dataIndex: "building_name",
            key: "building_name",
        },
        {
            title: "Room Name",
            dataIndex: "room_name",
            key: "room_name",
        },
        {
            title: "Image",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (text: string) => (
                <img src={text} alt="Location" className="object-cover w-16 h-16" />
            ),
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: IForgot) => (
                <div className="space-x-2">
                    <Button type="link" onClick={() => onEdit(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger onClick={() => onDelete(record.id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Forgot Management</h1>
                <Button type="primary" onClick={onAdd}>
                    Add Forgot Item
                </Button>
            </div>
            <Table dataSource={data} columns={columns} rowKey="id" className="shadow-lg" />
        </div>
    );
};

export default ForgotTable;
