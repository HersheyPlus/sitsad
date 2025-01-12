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
import ToiletService from '@/services/toilet.service';
import { useNotificationStore } from '@/stores/notification.store';
import DeviceService from '@/services/device.service';
import { IDevice } from '@/types/device';

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>,
    },
    {
        title: <a href="/dashboard">Dashboard</a>,
    },
    {
        title: "Toilet",
    },
];

const AdminToiletPage = () => {
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
            const data = await ToiletService.findByRoomId(roomId);
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
        }
        catch (error) {
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
            setBuildings(data);
        }
        catch (error) {
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

    const doAddItem = async (item: IItem) => {
        try {
            const newItem = await ToiletService.create(item);
            setItems((prevItems) => [...prevItems, newItem]);
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
                itemType={ItemType.TOILET}
                selectedBuilding={selectedBuilding}
                selectedRoom={selectedRoom}
            />

            <AdminItemCrud data={items} buildings={buildings} rooms={rooms} devices={devices} itemType={ItemType.TOILET} service={ToiletService} />

            <AdminItemHistory data={history} itemName={ItemType.TOILET} />
        </Flex>
    );
};

export default AdminToiletPage;
