import { IRoom } from "@/types/location";
import { Flex } from "antd";
import { useState } from "react";
import LocationFilter from "../LocationFilter";
import RoomTable from "./RoomTable";
import RoomModal from "./RoomModal";


const RoomWrapper = () => {
    const [data, setData] = useState<IRoom[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);

    const doSearch = () => {
        // do something
        console.log("Query: ", query);
    }

    const doAdd = () => {
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

    const doSave = (payload: IRoom) => {
        if (editingRoom) {
            setData((prevData) =>
                prevData.map((item) =>
                    item.room_id === editingRoom.room_id ? { ...editingRoom, ...payload } : item
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

            <RoomTable
                data={data}
                onAdd={doAdd}
                onEdit={doEdit}
                onDelete={doDelete}
            />

            <RoomModal
                visible={isModalOpen}
                editingRoom={editingRoom}
                onCancel={() => setIsModalOpen(false)}
                onSave={doSave}
            />

        </Flex>
    );
};

export default RoomWrapper;
