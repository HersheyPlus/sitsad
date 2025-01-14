import React, { useEffect, useState } from 'react';

import { Flex } from 'antd';

import XBreadcrumb from '@/components/Shared/XBreadcrumb';
import { useParams } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';
import TableOverview from '@/components/Shared/Item/overview/ItemOverview';
import ItemLayout from '@/components/Shared/Item/ItemLayout';
import { IItem, ItemType } from '@/types/item';
import ToiletService from '@/services/toilet.service';
import { useNotificationStore } from '@/stores/notification.store';


const ToiletSlugPage: React.FC = () => {
    const [items, setItems] = useState<IItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<IItem | null>(null);
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    const firstItem = items?.[0];

    const params = useParams();

    const roomId = params?.slug;

    const breadcrumbItems = [
        {
            title: <a href="/">Home</a>,
        },
        {
            title: <a href="/toilet">Toilet</a>,
        },
        {
            title: <a href={`/toilet?buildingId=${firstItem?.location.building.building_id}`}>Rooms</a>,
        },
        {
            title: firstItem?.location?.room.room_name || "",
        },
    ];

    const doSearchMultipleItems = async () => {
        if (!roomId) return;

        console.log("Fetching Multiple Items")

        try {
            const data = await ToiletService.findByRoomId(roomId);
            if (!data) return;
            setItems(data);
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doSelectItem = (item: IItem | null) => {
        if (item === null && selectedItem !== null) {
            setSelectedItem(null);
            return;
        }

        if (item === selectedItem) {
            setSelectedItem(null);
            return;
        }

        setSelectedItem(item);
    }

    useEffect(() => {
        doSearchMultipleItems();
    }, [roomId]);

    if (!params?.slug || !items) {
        return <NotFoundPage />
    }

    useEffect(() => {
        // Fetch data every 3 seconds
        const interval = setInterval(() => {
            doSearchMultipleItems();
        }, 3000);

        return () => clearInterval(interval);
    }, [])

    return (
        <Flex vertical gap={4} className='min-h-screen p-8 bg-gray-100' >
            <XBreadcrumb items={breadcrumbItems} />

            <ItemLayout itemName={ItemType.TOILET} items={items} selectedItem={selectedItem} onSelectItem={doSelectItem} />

            <TableOverview item={selectedItem} itemName={ItemType.TOILET} roomId={roomId} />
        </Flex>
    );
};

export default ToiletSlugPage;
