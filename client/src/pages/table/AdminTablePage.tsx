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
import { useNotificationStore } from '@/stores/notification.store';
import { IDevice } from '@/types/device';
import DeviceService from '@/services/device.service';

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
    const [devices, setDevices] = useState<IDevice[]>([]);

    const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | undefined>(undefined);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>(undefined);
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        doSearchDevices()
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
        try {
            const data = await TableService.findByRoomId(roomId);
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

    const doSearchHistory = async (roomId: string) => {
        try {
            const data = await HistoryService.findByRoomId(roomId);
            setHistory(data);

        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doSearchBuildings = async () => {
        try {
            const data = await BuildingService.findAll();
            setBuildings(data || []);
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doSearchDevices = async () => {
        try {
            const data = await DeviceService.findAll();
            setDevices(data || []);
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doSearchRooms = async (buildingId: string) => {
        try {
            const data = await RoomService.findByBuildingId(buildingId);
            setRooms(data || []);
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }

    }

    const doAddItem = async (item: IItem) => {
        try {
            const newItem = await TableService.create(item);
            setItems((prevItems) => [...prevItems, newItem]);
            openNotification({
                type: 'success',
                message: 'Success',
                description: 'Table created successfully'
            })
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
        <Flex vertical gap={4} className='p-4'>
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

            <AdminItemCrud data={items} buildings={buildings} rooms={rooms} devices={devices} itemType={ItemType.TABLE} service={TableService} />

            <AdminItemHistory data={history} itemName={ItemType.TABLE} />
        </Flex>
    );
};

export default AdminTablePage;
