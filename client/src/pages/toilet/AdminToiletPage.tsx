import { useEffect, useState } from 'react';

import { Flex } from 'antd';

import XBreadcrumb from '@/components/Shared/XBreadcrumb';
import { IBuilding, IRoom } from '@/types/location';
import { IItem, IItemHistory, IItemPayload, ItemType } from '@/types/item';

import BuildingService from '@/services/building.service';
import RoomService from '@/services/room.service';
import AdminItemLayout from '@/components/Shared/Item/admin/AdminItemLayout';
import AdminItemCrud from '@/components/Shared/Item/admin/AdminItemCrud';
import AdminSelector from '@/components/Shared/Item/admin/AdminSelector';
import AdminItemHistory from '@/components/Shared/Item/admin/AdminItemHistory';
import HistoryService from '@/services/history.service';
import ToiletService from '@/services/toilet.service';
import { useNotificationStore } from '@/stores/notification.store';

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

    const [selectedBuilding, setSelectedBuilding] = useState<IBuilding | undefined>(undefined);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>(undefined);
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )
    useEffect(() => {
        doSearchBuildings()
    }, [])

    useEffect(() => {
        if (selectedBuilding) {
            setRooms([])
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
            const data = await RoomService.findByKeywordAndItemType("", buildingId, ItemType.TOILET);
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

    const doSaveItem = async (item: IItem | IItemPayload, create: boolean) => {
        try {
            if (create) {
                await ToiletService.create(item);
                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Toilet created successfully'
                })
            } else {
                await ToiletService.update(item as IItem);
                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Toilet updated successfully'
                })
            }
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }

        await doSearchItems(selectedRoom?.room_id || '');
        // await doSearchRooms(selectedBuilding?.building_id || '');
    }

    const doRemoveItem = async (id: string) => {
        try {
            await ToiletService.delete(id);
            setItems((prevItems) => prevItems.filter((item) => item.item_id !== id));
            openNotification({
                type: 'success',
                message: 'Success',
                description: 'Toilet removed successfully'
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
                doSaveItem={doSaveItem}
            />

            <AdminItemCrud data={items} buildings={buildings} itemType={ItemType.TOILET} onSaveItem={doSaveItem} onRemoveItem={doRemoveItem} />

            <AdminItemHistory data={history} itemName={ItemType.TOILET} />
        </Flex>
    );
};

export default AdminToiletPage;
