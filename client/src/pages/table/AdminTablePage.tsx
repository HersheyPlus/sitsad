import React from 'react';

import TableLayout from '@/components/Pages/Table/admin/AdminTableLayout';
import TableHistory from '@/components/Pages/Table/admin/AdminTableHistory';

import { ITableHistory } from '@/types/table';
import { Flex } from 'antd';

import XBreadcrumb from '@/components/XBreadcrumb';

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

const data: ITableHistory[] = [
    {
        id: 1,
        tableId: 101,
        reservationTime: "2025-01-09 10:00 AM",
        leaveTime: "2025-01-09 12:00 PM",
        phoneNo: "1234567890",
    },
    {
        id: 2,
        tableId: 102,
        reservationTime: "2025-01-09 01:00 PM",
        leaveTime: "2025-01-09 03:00 PM",
        phoneNo: undefined,
    },
];

const AdminTablePage: React.FC = () => {
    return (
        <Flex vertical gap={4} className='p-8 bg-gray-100 mi -h-screen'>
            <XBreadcrumb items={breadcrumbItems} />

            <TableLayout />

            <TableHistory data={data} />
        </Flex>
    );
};

export default AdminTablePage;
