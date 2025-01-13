
import ItemFilter from '@/components/Shared/Item/ItemFilter';

import RoomList from '@/components/Shared/Location/RoomList';
import XBreadcrumb from '@/components/Shared/XBreadcrumb';
import RoomService from '@/services/room.service';
import { useNotificationStore } from '@/stores/notification.store';
import { ItemType } from '@/types/item';
import { IRoom } from '@/types/location';
import { Flex, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { IBuildingIdProps } from '../Table/TableRoomList';

const { Title } = Typography;

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>
    },
    {
        title: <a href="/toilet">Toilet</a>
    },
    {
        title: "Room"
    }
];


const ToiletRoomList = ({ buildingId }: IBuildingIdProps) => {
    const [query, setQuery] = useState("")
    const [rooms, setRooms] = useState<IRoom[]>([])
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )
    useEffect(() => {
        doSearch()
    }, [query])

    const doSearch = async () => {
        // Search using ItemType.Toilet
        try {
            const data = await RoomService.findByKeywordAndItemType(query, buildingId, ItemType.TOILET)
            setRooms(data)
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    return (
        <Flex vertical gap={4} className="p-4">
            <XBreadcrumb items={breadcrumbItems} />

            <ItemFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <Title level={2} className="mb-6">
                Available Rooms for Toilets
            </Title>

            <RoomList items={rooms} itemType={ItemType.TOILET} />
        </Flex>
    )
}

export default ToiletRoomList