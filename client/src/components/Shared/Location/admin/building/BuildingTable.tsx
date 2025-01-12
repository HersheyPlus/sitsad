import { Table, Button } from "antd";
import { IBuilding } from "@/types/location";

interface IProps {
    data: IBuilding[];
    onEdit: (record: IBuilding) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const BuildingTable: React.FC<IProps> = ({
    data,
    onEdit,
    onDelete,
    onAdd,
}) => {
    const columns = [
        {
            title: "Building Name",
            dataIndex: "building_name",
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
            title: "Actions",
            key: "actions",
            render: (record: IBuilding) => (
                <div className="space-x-2">
                    <Button type="link" onClick={() => onEdit(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger onClick={() => onDelete(record.building_id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Building Management</h1>
                <Button type="primary" onClick={onAdd}>
                    Add Building
                </Button>
            </div>
            <Table dataSource={data} columns={columns} rowKey="id" className="shadow-lg" />
        </div>
    );
};

export default BuildingTable;
