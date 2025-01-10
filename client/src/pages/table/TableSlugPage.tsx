import React from 'react';
import TableLayout from '@/components/Pages/Table/TableLayout';

import { Flex } from 'antd';

import XBreadcrumb from '@/components/XBreadcrumb';
import { useParams } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';
import TableOverview from '@/components/Pages/Table/overview/TableOverview';

const TableSlugPage: React.FC = () => {
    const params = useParams();

    const breadcrumbItems = [
        {
            title: <a href="/">Home</a>,
        },
        {
            title: <a href="/table">Tables</a>,
        },
        {
            title: params?.slug || "",
        },
    ];

    // TODO: fetch table by slug

    if (!params?.slug) {
        return <NotFoundPage />
    }

    const table = { id: 1, x: 0, y: 0, width: 100, height: 100, available: true, name: 'Table 1' }


    return (
        <Flex vertical gap={4} className='p-8 bg-gray-100 mi -h-screen'>
            <XBreadcrumb items={breadcrumbItems} />

            <TableLayout />

            <TableOverview table={table} />
        </Flex>
    );
};

export default TableSlugPage;
