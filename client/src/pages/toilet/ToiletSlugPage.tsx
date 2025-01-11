import React, { useState } from 'react';

import { Flex } from 'antd';

import XBreadcrumb from '@/components/XBreadcrumb';
import { useParams } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';
import TableOverview from '@/components/Pages/Item/overview/ItemOverview';
import ItemLayout from '@/components/Pages/Item/ItemLayout';
import { IItem, ItemType } from '@/types/item';

const item: IItem = {
    id: 1,
    name: "Table 1",
    description: "Table 1 description",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    available: true,
}


const ToiletSlugPage: React.FC = () => {
    const [items] = useState<IItem[]>([item]);
    const params = useParams();

    const breadcrumbItems = [
        {
            title: <a href="/">Home</a>,
        },
        {
            title: <a href="/toilets">Toilets</a>,
        },
        {
            title: params?.slug || "",
        },
    ];


    // TODO: fetch an item by slug


    if (!params?.slug) {
        return <NotFoundPage />
    }

    return (
        <Flex vertical gap={4} className='min-h-screen p-8 bg-gray-100'>
            <XBreadcrumb items={breadcrumbItems} />

            <ItemLayout itemName={ItemType.TABLE} items={items} />

            <TableOverview item={item} itemName={ItemType.TABLE} />
        </Flex>
    );
};

export default ToiletSlugPage;
