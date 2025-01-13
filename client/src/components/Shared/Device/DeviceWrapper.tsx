import { IBuilding, IRoom } from "@/types/location";
import { Flex } from "antd";
import { useEffect, useState } from "react";
import DeviceTable from "./DeviceTable";
import DeviceModal from "./DeviceModal";
import BuildingService from "@/services/building.service";
import RoomService from "@/services/room.service";
import { useNotificationStore } from "@/stores/notification.store";
import { IDevice } from "@/types/device";
import DeviceService from "@/services/device.service";
import DeviceFilter from "./DeviceFilter";

const DeviceWrapper = () => {
    const [devices, setDevices] = useState<IDevice[]>([]);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [buildings, setBuildings] = useState<IBuilding[]>([]);
    const [editingDevice, setEdiingDevice] = useState<IDevice | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string>("");


    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        doGetBuildings();
        doGetRooms()
        doSearch()
    }, [])

    const doSearch = async () => {
        // do something
        try {
            const data = await DeviceService.findByKeyword(query)
            setDevices(data)
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

    const doGetRooms = async () => {
        try {
            const data = await RoomService.findAll()
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

    const openAddModal = () => {
        setEdiingDevice(null);
        setIsModalOpen(true);
    };

    const doEdit = (record: IDevice) => {
        setEdiingDevice(record);
        setIsModalOpen(true);
    };

    const doDelete = async (id: string) => {
        try {
            setDevices((prevData) => prevData.filter((item) => item.device_id !== id));

            await DeviceService.delete(id)
            openNotification({
                type: 'success',
                message: 'Success',
                description: 'Device deleted successfully'
            })

        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    };

    const doSave = async (payload: IDevice) => {
        if (editingDevice) {
            setDevices((prevData) =>
                prevData.map((item) =>
                    item.device_id === editingDevice.device_id ? { ...editingDevice, ...payload } : item
                )
            );


            const topic = payload.type === 'Camera' ? `table/${payload.building_id}/${payload.room_id}/${payload.name}` :
                payload.topic

            const newPayload = {
                ...payload,
                topic
            }

            try {
                await DeviceService.update(newPayload)

                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Device updated successfully'
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
            setDevices((prevData) => [
                ...prevData,
                { ...payload, id: Math.random().toString(36).substr(2, 9) },
            ]);


            const topic = payload.type === 'Camera' ? `table/${payload.building_id}/${payload.room_id}/${payload.name}` :
                payload.topic

            const newPayload = {
                ...payload,
                device_id: new Date().getTime().toString(),
                topic
            }


            try {
                await DeviceService.create(newPayload)

                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Device created successfully'
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
            <DeviceFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <DeviceTable
                data={devices}
                onAdd={openAddModal}
                onEdit={doEdit}
                onDelete={doDelete}
                rooms={rooms}
                buildings={buildings}
            />

            <DeviceModal
                visible={isModalOpen}
                editingDevice={editingDevice}
                buildings={buildings}
                rooms={rooms}
                onCancel={() => setIsModalOpen(false)}
                onSave={doSave}
            />

        </Flex>
    );
};

export default DeviceWrapper;
