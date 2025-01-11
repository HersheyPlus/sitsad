import { useEffect, useState } from 'react';

import { Flex } from 'antd';

import XBreadcrumb from '@/components/XBreadcrumb';
import { IBuilding, IRoom } from '@/types/location';
import { IItem, IItemHistory, ItemType } from '@/types/item';

import BuildingService from '@/services/building.service';
import RoomService from '@/services/room.service';
import AdminItemLayout from '@/components/Shared/Item/admin/AdminItemLayout';
import AdminItemCrud from '@/components/Shared/Item/admin/AdminItemCrud';
import AdminSelector from '@/components/Shared/Item/admin/AdminSelector';
import AdminItemHistory from '@/components/Shared/Item/admin/AdminItemHistory';
import HistoryService from '@/services/history.service';
import TableService from '@/services/table.service';

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

const AdminTablePage = () => {
    const [items, setItems] = useState<IItem[]>([]);
    const [history, setHistory] = useState<IItemHistory[]>([]);
    const [buildings, setBuildings] = useState<IBuilding[]>([]);
    const [rooms, setRooms] = useState<IRoom[]>([]);

    const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | undefined>(undefined);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>(undefined);

    useEffect(() => {
        doSearchBuildings()
    }, [])

    useEffect(() => {
        if (selectedBuilding) {
            doSearchRooms(selectedBuilding.building_id)
            setSelectedRoom(undefined)
        }
    }, [selectedBuilding])

    useEffect(() => {
        if (selectedRoom) {
            doSearchItems(selectedRoom.room_id)
            doSearchHistory(selectedRoom.room_id)
        } else {
            setItems([]);
            setHistory([]);
        }
    }, [selectedBuilding, selectedRoom])


    const doSearchItems = async (roomId: string) => {
        const data = await TableService.findByRoomId(roomId);
        setItems(data);
    }

    const doSearchHistory = async (roomId: string) => {
        const data = await HistoryService.findByRoomId(roomId);
        setHistory(data);
    }

    const doSearchBuildings = async () => {
        const data = await BuildingService.findAll();
        setBuildings(data || []);
    }

    const doSearchRooms = async (buildingId: string) => {
        const data = await RoomService.findByBuildingId(buildingId);
        setRooms(data || []);
    }

    const doAddItem = async (item: IItem) => {
        const newItem = await TableService.create(item);
        setItems((prevItems) => [...prevItems, newItem]);
    }

    return (
        <Flex vertical gap={4} className='min-h-screen p-8 bg-gray-100'>
            <XBreadcrumb items={breadcrumbItems} />

            <AdminSelector
                buildings={buildings}
                rooms={rooms}
                selectedBuilding={selectedBuilding}
                selectedRoom={selectedRoom}
                onBuildingSelect={setSelectedBuilding}
                onRoomSelect={setSelectedRoom}
            />

            <AdminItemLayout
                data={items}
                doUpdateItem={setItems}
                doAddItem={doAddItem}
                itemType={ItemType.TABLE}
                selectedBuilding={selectedBuilding}
                selectedRoom={selectedRoom}
            />

            <AdminItemCrud data={items} buildings={buildings} rooms={rooms} itemType={ItemType.TABLE} />

            <AdminItemHistory data={history} itemName={ItemType.TABLE} />
        </Flex>
    );
};

export default AdminTablePage;
