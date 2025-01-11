import React, { useEffect, useState } from 'react';

import { Flex } from 'antd';

import XBreadcrumb from '@/components/XBreadcrumb';
import { useParams } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';
import TableOverview from '@/components/Shared/Item/overview/ItemOverview';
import ItemLayout from '@/components/Shared/Item/ItemLayout';
import { IItem, ItemType } from '@/types/item';
import TableService from '@/services/table.service';

const TableSlugPage: React.FC = () => {
    const [items, setItems] = useState<IItem[]>([]);
    const [item, setItem] = useState<IItem | null>(null);

    const params = useParams();

    const breadcrumbItems = [
        {
            title: <a href="/">Home</a>,
        },
        {
            title: <a href="/table">Table</a>,
        },
        {
            title: <a href={`/table?buildingId=${item?.location.building.building_id}`}>Rooms</a>,
        },
        {
            title: item?.name || "",
        },
    ];

    const doSearchItem = async () => {
        // Search using ItemType.Toilet
        if (!params?.slug) return;

        const data = await TableService.findById(params?.slug);

        if (!data) return;

        setItem(data);
    }

    const doSearchMultipleItems = async () => {
        if (!item) return;

        const roomId = item.location.room.room_id;

        const data = await TableService.findByRoomId(roomId);

        if (!data) return;

        setItems(data);
    }

    useEffect(() => {
        doSearchItem();
    }, [params]);

    useEffect(() => {
        doSearchMultipleItems();
    }, [item]);

    if (!params?.slug || !item) {
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

export default TableSlugPage;
