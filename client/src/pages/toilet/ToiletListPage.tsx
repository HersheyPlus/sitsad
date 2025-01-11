

import ItemFilter from '@/components/Pages/Item/ItemFilter';
import ItemList from '@/components/Pages/Item/ItemList';
import XBreadcrumb from '@/components/XBreadcrumb';
import { ItemType } from '@/types/item';
import { Flex, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const mockupLocations = [
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
        title: "Toilets"
    }
];

const ToiletListPage = () => {
    const [query, setQuery] = useState("")


    const doSearch = () => {
        // Search using ItemType.Toilet
        console.log('Searching for:', query);
    }

    // Fetch locations based by itemName

    return (
        <Flex vertical gap={4} className="p-4">
            <XBreadcrumb items={breadcrumbItems} />

            <ItemFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <Title level={2} className="mb-6">
                Available Toilets
            </Title>

            <ItemList items={mockupLocations} itemType={ItemType.TOILET} />
        </Flex>
    )
}

export default ToiletListPage