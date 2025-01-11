
import { Table, Card, Space } from "antd";
import { IItemHistory } from "@/types/item";
import { useState } from "react";

import dayjs, { Dayjs } from "dayjs";

import type { ColumnsType } from "antd/es/table";

import isBetween from "dayjs/plugin/isBetween";
import Filter from "./AdminItemFilter";
import { PhoneOutlined } from "@ant-design/icons";

interface IProps {
    data: IItemHistory[];
    itemName: string;
}

dayjs.extend(isBetween);

const AdminTableHistory = ({ data }: IProps) => {
    const [filteredData, setFilteredData] = useState<IItemHistory[]>(data);

    const [query, setQuery] = useState<{
        date?: [Dayjs, Dayjs] | null;
        phoneNo?: string;
    }>({});

    // Update the query state
    const doChangeQuery = (key: string, value: [Dayjs, Dayjs] | string | null) => {
        setQuery({
            ...query,
            [key]: value,
        });
    };

    // Apply the filter and update filteredData
    const doSearch = () => {
        const { date, phoneNo } = query;

        const filtered = data.filter((item) => {
            const matchesDate =
                date && date[0] && date[1]
                    ? dayjs(item.reservationTime).isBetween(date[0], date[1], "day", "[]")
                    : true;

            const matchesPhone = phoneNo
                ? item.phoneNo?.toLowerCase().includes(phoneNo.toLowerCase())
                : true;

            return matchesDate && matchesPhone;
        });

        setFilteredData(filtered);
    };

    const columns: ColumnsType<IItemHistory> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Item ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.itemId - b.itemId,
        },
        {
            title: "Reservation Time",
            dataIndex: "reservationTime",
            key: "reservationTime",
            sorter: (a, b) =>
                new Date(a.reservationTime).getTime() -
                new Date(b.reservationTime).getTime(),
        },
        {
            title: "Leave Time",
            dataIndex: "leaveTime",
            key: "leaveTime",
            sorter: (a, b) =>
                new Date(a.leaveTime).getTime() - new Date(b.leaveTime).getTime(),
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNo',
            key: 'phoneNo',
            render: (text: string | undefined) => text ? (
                <Space>
                    <PhoneOutlined />
                    {text}
                </Space>
            ) : 'N/A',
        },
    ];

    return (
        <Card style={{ backgroundColor: "##ffffff", padding: "20px", borderRadius: "8px" }} title={
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5rem" }}>
                <h2>Reserveation History</h2>
            </div>
        }>

            <Filter doChangeQuery={doChangeQuery} doSearch={doSearch} />

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

export default AdminTableHistory;
