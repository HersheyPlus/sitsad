import { IBuilding, IRoom } from "@/types/location";
import { Flex } from "antd";
import { useEffect, useState } from "react";
import LocationFilter from "../LocationFilter";
import RoomTable from "./RoomTable";
import RoomModal from "./RoomModal";
import BuildingService from "@/services/building.service";
import RoomService from "@/services/room.service";
import { useNotificationStore } from "@/stores/notification.store";


const RoomWrapper = () => {
    const [data, setData] = useState<IRoom[]>([]);
    const [buildings, setBuildings] = useState<IBuilding[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )
    useEffect(() => {
        doGetBuildings();
        doSearch()
    }, [])


    const doSearch = async () => {
        // do something
        try {
            const data = await RoomService.findByKeyword(query)
            setData(data)
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }

    }

    const doGetBuildings = async () => {
        try {
            const data = await BuildingService.findAll()
            setBuildings(data)
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const openAddModal = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const doEdit = (record: IRoom) => {
        setEditingRoom(record);
        setIsModalOpen(true);
    };

    const doDelete = (id: string) => {
        setData((prevData) => prevData.filter((item) => item.room_id !== id));
    };

    const doSave = async (payload: IRoom) => {
        if (editingRoom) {
            setData((prevData) =>
                prevData.map((item) =>
                    item.room_id === editingRoom.room_id ? { ...editingRoom, ...payload } : item
                )
            );

            try {
                await RoomService.update(editingRoom)

                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Building updated successfully'
                })
            } catch (error) {
                openNotification({
                    type: 'error',
                    message: 'Error',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    description: (error as any).message
                })
            }
        } else {
            setData((prevData) => [
                ...prevData,
                { ...payload, id: Math.random().toString(36).substr(2, 9) },
            ]);

            try {
                await RoomService.create(payload)

                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Room created successfully'
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

        setIsModalOpen(false);
    };

    return (
        <Flex vertical gap={4} className="p-4">
            <LocationFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <RoomTable
                data={data}
                onAdd={openAddModal}
                onEdit={doEdit}
                onDelete={doDelete}
            />

            <RoomModal
                visible={isModalOpen}
                editingRoom={editingRoom}
                buildings={buildings}
                onCancel={() => setIsModalOpen(false)}
                onSave={doSave}
            />

        </Flex>
    );
};

export default RoomWrapper;
