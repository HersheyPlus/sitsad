import { IItem, ItemType } from "@/types/item";
import { mockupBuildings } from "./building.service";
import { mockupRooms } from "./room.service";

const mockupToilet: IItem[] = [{
    item_id: "4",
    type: ItemType.TOILET,
    building_id: "1",
    available: true,
    position_x: 50,
    position_y: 50,
    width: 100,
    height: 100,
    name: "LX Toilet 4",
    location: {
        building: mockupBuildings[0],
        room: mockupRooms[0]
    }
},
{
    item_id: "5",
    type: ItemType.TOILET,
    building_id: "1",
    available: true,
    position_x: 100,
    position_y: 100,
    width: 100,
    height: 100,
    name: "LX Toilet 5",
    location: {
        building: mockupBuildings[0],
        room: mockupRooms[1]
    }
},
{
    item_id: "6",
    type: ItemType.TOILET,
    building_id: "1",
    available: true,
    position_x: 150,
    position_y: 150,
    width: 100,
    height: 100,
    name: "SIT Toilet 6",
    location: {
        building: mockupBuildings[1],
        room: mockupRooms[2]
    }
}]

const ToiletService = {

    async findAll() {
        return mockupToilet;
    },

    async findById(id: string) {
        return mockupToilet.find(toilet => `${toilet.item_id}` === id);
    },

    async findByRoomId(room_id: string) {
        return mockupToilet.filter(toilet => toilet.location.room.room_id === room_id);
    },

    async findByName(name: string) {
        return mockupToilet.find(toilet => toilet.name === name);
    },

    async create(toilet: IItem) {
        mockupToilet.push(toilet);

        return toilet;
    },

    async update(toilet: IItem) {
        const index = mockupToilet.findIndex(t => t.item_id === toilet.item_id);
        if (index !== -1) {
            mockupToilet[index] = toilet;
        }
    },

    async delete(id: string) {
        const index = mockupToilet.findIndex(t => t.item_id === id);
        if (index !== -1) {
            mockupToilet.splice(index, 1);
        }
    }
}

export default ToiletService