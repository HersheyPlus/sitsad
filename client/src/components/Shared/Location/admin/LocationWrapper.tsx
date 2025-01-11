import { useState } from "react";
import LocationTable from "../LocationTable";
import LocationModal from "../LocationModal";
import { ILocation } from "@/types/location";
import { Flex } from "antd";
import LocationFilter from "../LocationFilter";

const LocationWrapper = () => {
    const [data, setData] = useState<ILocation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [editingLocation, setEditingLocation] = useState<ILocation | null>(null);

    const doSearch = () => {
        // do something
        console.log("Query: ", query);
    }

    const doAdd = () => {
        setEditingLocation(null);
        setIsModalOpen(true);
    };

    const doEdit = (record: ILocation) => {
        setEditingLocation(record);
        setIsModalOpen(true);
    };

    const doDelete = (id: string) => {
        setData((prevData) => prevData.filter((item) => item.id !== id));
    };

    const doSave = (payload: ILocation) => {
        if (editingLocation) {
            setData((prevData) =>
                prevData.map((item) =>
                    item.id === editingLocation.id ? { ...editingLocation, ...payload } : item
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

            <LocationTable
                data={data}
                onAdd={doAdd}
                onEdit={doEdit}
                onDelete={doDelete}
            />

            <LocationModal
                visible={isModalOpen}
                editingLocation={editingLocation}
                onCancel={() => setIsModalOpen(false)}
                onSave={doSave}
            />

        </Flex>
    );
};

export default LocationWrapper;
