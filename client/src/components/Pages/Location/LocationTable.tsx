import React from "react";
import { Table, Button } from "antd";
import { ILocation } from "@/types/location";

interface LocationTableProps {
    data: ILocation[];
    onEdit: (record: ILocation) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const LocationTable: React.FC<LocationTableProps> = ({
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
            render: (record: ILocation) => (
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
                <h1 className="text-2xl font-bold">Location Management</h1>
                <Button type="primary" onClick={onAdd}>
                    Add Location
                </Button>
            </div>
            <Table dataSource={data} columns={columns} rowKey="id" className="shadow-lg" />
        </div>
    );
};

export default LocationTable;
