import { IItem, ItemType } from "@/types/item";
import { mockupBuildings } from "./building.service";
import { mockupRooms } from "./room.service";


const mockupTable: IItem[] = [{
    item_id: "1",
    type: ItemType.TABLE,
    building_id: "1",
    available: true,
    position_x: 0,
    position_y: 0,
    width: 100,
    height: 100,
    name: "LX Table 1",
    location: {
        building: mockupBuildings[0],
        room: mockupRooms[0]
    }
},
{
    item_id: "2",
    type: ItemType.TABLE,
    building_id: "1",
    available: true,
    position_x: 0,
    position_y: 0,
    width: 100,
    height: 100,
    name: "LX Table 2",
    location: {
        building: mockupBuildings[0],
        room: mockupRooms[1]
    }
},
{
    item_id: "3",
    type: ItemType.TABLE,
    building_id: "1",
    available: true,
    position_x: 0,
    position_y: 0,
    width: 100,
    height: 100,
    name: "SIT Table 3",
    location: {
        building: mockupBuildings[1],
        room: mockupRooms[2]
    }
}]

const TableService = {

    async findAll() {
        return mockupTable;
    },

    async findById(id: string) {
        return mockupTable.find(table => `${table.item_id}` === id);
    },

    async findByRoomId(roomId: string) {
        return mockupTable.filter(table => table.location.room.room_id === roomId);
    },

    async findByKeyword(keyword: string) {
        return mockupTable.filter(table => table.name.toLowerCase().includes(keyword.toLowerCase()));
    },

    async findByName(name: string) {
        return mockupTable.find(table => table.name === name);
    },

    async create(table: IItem) {
        mockupTable.push(table);

        return table;
    },

    async update(table: IItem) {
        const index = mockupTable.findIndex(t => t.item_id === table.item_id);
        if (index !== -1) {
            mockupTable[index] = table;
        }
    },

    async delete(id: string) {
        const index = mockupTable.findIndex(t => t.item_id === id);
        if (index !== -1) {
            mockupTable.splice(index, 1);
        }
    }
}

export default TableService