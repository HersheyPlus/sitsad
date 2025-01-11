

import ItemFilter from '@/components/Shared/Item/ItemFilter';

import RoomList from '@/components/Shared/Location/RoomList';
import XBreadcrumb from '@/components/XBreadcrumb';
import RoomService from '@/services/room.service';
import { ItemType } from '@/types/item';
import { IRoom } from '@/types/location';
import { Flex, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title } = Typography;

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>
    },
    {
        title: <a href="/table">Table</a>
    },
    {
        title: "Rooms"
    }
];

const TableRoomList = () => {
    const [query, setQuery] = useState("")
    const [rooms, setRooms] = useState<IRoom[]>([])

    useEffect(() => {
        doSearch()
    }, [query])

    const doSearch = async () => {
        // Search using ItemType.Toilet
        const data = await RoomService.findByKeywordAndItemType(query, ItemType.TABLE)
        setRooms(data)
    }

    return (
        <Flex vertical gap={4} className="p-4">
            <XBreadcrumb items={breadcrumbItems} />

            <ItemFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <Title level={2} className="mb-6">
                Available Room for Tables
            </Title>

            <RoomList items={rooms} itemType={ItemType.TABLE} />
        </Flex>
    )
}

export default TableRoomList