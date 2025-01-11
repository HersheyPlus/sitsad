import { IBuilding } from "@/types/location";
import { Flex } from "antd";
import { useEffect, useState } from "react";
import LocationFilter from "../LocationFilter";
import BuildingTable from "./BuildingTable";
import BuildingModal from "./BuildingModal";
import BuildingService from "@/services/building.service";

const BuildingWrapper = () => {
    const [data, setData] = useState<IBuilding[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [editingBuilding, setEditingRoom] = useState<IBuilding | null>(null);

    useEffect(() => {
        doSearch()
    }, [])

    const doSearch = async () => {
        // do something
        const data = await BuildingService.findByKeyword(query)
        setData(data)
    }

    const doAdd = () => {
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

    const doSave = (payload: IBuilding) => {
        if (editingBuilding) {
            setData((prevData) =>
                prevData.map((item) =>
                    item.building_id === editingBuilding.building_id ? { ...editingBuilding, ...payload } : item
                )
            );
        } else {
            setData((prevData) => [
                ...prevData,
                { ...payload, id: Math.random().toString(36).substr(2, 9) },
            ]);
        }
        setIsModalOpen(false);
    };

    return (
        <Flex vertical gap={4} className="p-4">
            <LocationFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <BuildingTable
                data={data}
                onAdd={doAdd}
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
