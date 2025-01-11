import { Table, Card, Space, Input, Select, Button, Popconfirm } from "antd";
import { IItem } from "@/types/item";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Filter from "./AdminItemCrudFilter";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ILocation } from "@/types/location";

dayjs.extend(isBetween);

interface IProps {
    data: IItem[];
    locations: ILocation[]; // Assuming locations are passed as a prop
}

const AdminTableCrud = ({ data, locations }: IProps) => {
    const [filteredData, setFilteredData] = useState<IItem[]>(data);
    const [query, setQuery] = useState<string>("");
    const [editingKey, setEditingKey] = useState<string | null>(null);

    // Apply the filter and update filteredData
    const doSearch = () => {
        const filtered = data.filter((item) => {
            const matchesTableId = item.id.toString().includes(query);
            const matchesTableName = item.name?.toLowerCase().includes(query.toLowerCase());
            return matchesTableId || matchesTableName;
        });
        setFilteredData(filtered);
    };

    const enterEditMode = (key: string) => {
        setEditingKey(key);
    };

    // Handle table data edit
    const doEdit = (key: React.Key, value: string | number | ILocation | undefined, column: string) => {
        const newData = [...filteredData];
        const index = newData.findIndex((item) => key === item.id);
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
        console.log("Save", key);
        setEditingKey(null);
        // Here you can handle the save logic, like making an API call
    };

    // Handle remove table
    const doRemove = (id: number) => {
        setFilteredData(filteredData.filter((item) => item.id !== id));
    };

    const columns: ColumnsType<IItem> = [
        {
            title: "Table ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
            render: (text) => <span>{text}</span>,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <EditableCell
                    editable={editingKey === record.id.toString()}
                    value={text}
                    onChange={(value) => doEdit(record.id, value, "name")}
                />
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text, record) => (
                <EditableCell
                    editable={editingKey === record.id.toString()}
                    value={text}
                    onChange={(value) => doEdit(record.id, value, "description")}
                />
            ),
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            render: (location: ILocation, record) => (
                <Select
                    style={{
                        width: "100%",
                    }}
                    value={location ? location.id : undefined}
                    onChange={(value) => doEdit(record.id, locations.find((loc) => loc.id === value), "location")}
                    disabled={editingKey !== record.id.toString()}
                >
                    {locations.map((loc) => (
                        <Select.Option key={loc.id} value={loc.id}>
                            {loc.title}
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
                    {editingKey === record.id.toString() ? (
                        <>
                            <Button type="link" onClick={() => doSave(record.id.toString())}>Save</Button>
                            <Button type="link" onClick={doCancel}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => enterEditMode(record.id.toString())}
                            />
                            <Popconfirm
                                title="Are you sure to delete this item?"
                                onConfirm={() => doRemove(record.id)}
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
                    <h2>Table Manager</h2>
                </div>
            }
        >
            <Filter doChangeQuery={setQuery} doSearch={doSearch} />
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
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

export default AdminTableCrud;
