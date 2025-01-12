import { IBuilding } from "@/types/location";
import { Flex } from "antd";
import { useEffect, useState } from "react";
import LocationFilter from "../LocationFilter";
import BuildingTable from "./BuildingTable";
import BuildingModal from "./BuildingModal";
import BuildingService from "@/services/building.service";
import { useNotificationStore } from "@/stores/notification.store";

const BuildingWrapper = () => {
    const [data, setData] = useState<IBuilding[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [editingBuilding, setEditingRoom] = useState<IBuilding | null>(null);
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        doSearch()
    }, [])

    const doSearch = async () => {
        // do something
        try {
            const data = await BuildingService.findByKeyword(query)
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

    const openAddModal = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const doEdit = (record: IBuilding) => {
        setEditingRoom(record);
        setIsModalOpen(true);
    };

    const doDelete = (id: string) => {
        setData((prevData) => prevData.filter((item) => item.building_id !== id));
    };

    const doSave = async (payload: IBuilding) => {
        if (editingBuilding) {
            setData((prevData) =>
                prevData.map((item) =>
                    item.building_id === editingBuilding.building_id ? { ...editingBuilding, ...payload } : item
                )
            );

            try {
                await BuildingService.update(editingBuilding)

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
                await BuildingService.create(payload)

                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Building created successfully'
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

            <BuildingTable
                data={data}
                onAdd={openAddModal}
                onEdit={doEdit}
                onDelete={doDelete}
            />

            <BuildingModal
                visible={isModalOpen}
                editingBuilding={editingBuilding}
                onCancel={() => setIsModalOpen(false)}
                onSave={doSave}
            />

        </Flex>
    );
};

export default BuildingWrapper;
