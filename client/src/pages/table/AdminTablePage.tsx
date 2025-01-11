import { useState } from 'react';

import TableLayout from '@/components/Pages/Item/admin/AdminItemLayout';
import TableHistory from '@/components/Pages/Item/admin/AdminItemHistory';
import TableCrud from '@/components/Pages/Item/admin/AdminItemCrud';

import { IItem, IItemHistory, ItemType } from '@/types/item';
import { Flex } from 'antd';

import XBreadcrumb from '@/components/XBreadcrumb';
import { ILocation } from '@/types/location';

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>,
    },
    {
        title: <a href="/dashboard">Dashboard</a>,
    },
    {
        title: "Table",
    },
];

const history: IItemHistory[] = [
    {
        id: 1,
        itemId: 101,
        reservationTime: "2025-01-09 10:00 AM",
        leaveTime: "2025-01-09 12:00 PM",
        phoneNo: "1234567890",
    },
    {
        id: 2,
        itemId: 102,
        reservationTime: "2025-01-09 01:00 PM",
        leaveTime: "2025-01-09 03:00 PM",
        phoneNo: undefined,
    },
];

const table: IItem[] = [
    {
        id: 101,
        x: 0,
        y: 0,
        available: true,
        name: "Table 1",
        width: 100,
        height: 100,
    },
    {
        id: 102,
        x: 100,
        y: 0,
        available: true,
        name: "Table 2",
        width: 100,
        height: 100,
    },
    {
        id: 103,
        x: 200,
        y: 0,
        available: false,
        name: "Table 3",
        width: 100,
        height: 100,
    },
    {
        id: 104,
        x: 300,
        y: 0,
        available: false,
        name: "Table 4",
        width: 100,
        height: 100,
    },
]

const locations: ILocation[] = [
    {
        id: "1",
        title: "Location 1",
        description: "Location 1 description",
        image: "/placeholder.svg?height=96&width=96",
        current: 7,
        total: 10,
    }
]


const AdminTablePage = () => {
    const [tables, setTables] = useState<IItem[]>(table);

    // TODO: fetch data from API

    return (
        <Flex vertical gap={4} className='min-h-screen p-8 bg-gray-100'>
            <XBreadcrumb items={breadcrumbItems} />

            <TableLayout data={tables} doUpdateItem={setTables} />

            <TableCrud data={tables} locations={locations} />

            <TableHistory data={history} itemName={ItemType.TOILET} />
        </Flex>
    );
};

export default AdminTablePage;
