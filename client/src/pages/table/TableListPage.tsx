
import TableFilter from '@/components/Pages/Table/TableFilter';
import TableList from '@/components/Pages/Table/TableList';
import XBreadcrumb from '@/components/XBreadcrumb';
import { Flex, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const sampleItems = [
    {
        id: '1',
        title: 'Project Alpha',
        description: 'Innovative software development project',
        image: '/placeholder.svg?height=96&width=96',
        current: 7,
        total: 10,
    },
    {
        id: '2',
        title: 'Marketing Campaign',
        description: 'Social media outreach and brand awareness',
        image: '/placeholder.svg?height=96&width=96',
        current: 3,
        total: 5,
    },
    {
        id: '3',
        title: 'Product Launch',
        description: 'New product line introduction to the market',
        image: '/placeholder.svg?height=96&width=96',
        current: 2,
        total: 8,
    },
    {
        id: '4',
        title: 'Customer Support Improvement',
        description: 'Enhancing customer service protocols',
        image: '/placeholder.svg?height=96&width=96',
        current: 4,
        total: 6,
    },
];

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>
    },
    {
        title: "Tables"
    }
];

const TableListPage = () => {
    const [query, setQuery] = useState("")


    const doSearch = () => {
        console.log('Searching for:', query);
    }

    return (
        <Flex vertical gap={4} className="p-4">
            <XBreadcrumb items={breadcrumbItems} />

            <TableFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <Title level={2} className="mb-6">
                Available Tables
            </Title>
            <TableList items={sampleItems} />
        </Flex>
    )
}

export default TableListPage