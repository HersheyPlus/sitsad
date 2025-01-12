import { IRoom } from "@/types/location";

export const mockupRooms: IRoom[] = [{
    room_id: "1",
    building_id: "1",
    room_name: "LX Learning Garden",
    description: "LX Learning Garden is a place for students to study and relax",
    imageURL: "https://www.lib.kmutt.ac.th/wp-content/uploads/slider/cache/d7722f73105a10e7c743bbc9ab1992a8/IMG_5500-scaled.jpg"
},
{
    room_id: "2",
    building_id: "1",
    room_name: "LX 7th Floor",
    description: "LX 7th Floor is a place for students to study and relax",
    imageURL: "https://www.lib.kmutt.ac.th/wp-content/uploads/slider/cache/80a1858af94aa7e3a24c085c5a319e28/IMG_5487-scaled.jpg"
},
{
    room_id: "3",
    building_id: "1",
    room_name: "SIT Toilet Floor 1",
    description: "SIT Toilet Floor 1 is a place for students to study and relax",
    imageURL: "https://www.camphub.in.th/wp-content/uploads/2024/10/camphub-1.png"
}]

const RoomService = {

    async findAll() {
        return mockupRooms;
    },

    async findById(id: string) {
        return mockupRooms.find(room => room.room_id === id);
    },

    async findByBuildingId(building_id: string) {
        return mockupRooms.filter(room => room.building_id === building_id);
    },

    async findByName(name: string) {
        return mockupRooms.find(room => room.room_name === name);
    },

    async findByKeyword(keyword: string) {
        return mockupRooms.filter(room => room.room_name.toLowerCase().includes(keyword.toLowerCase()));
    },

    async findByKeywordAndItemType(keyword: string, itemType: string) {
        if (!keyword) return mockupRooms;

        return mockupRooms.filter(room => room.room_name.toLowerCase().includes(keyword.toLowerCase()));
    },

    async create(room: IRoom) {
        mockupRooms.push(room);
    },

    async update(roomId: string, room: IRoom) {
        const index = mockupRooms.findIndex(r => r.room_id === room.room_id);
        if (index !== -1) {
            mockupRooms[index] = room;
        }
    },

    async delete(id: string) {
        const index = mockupRooms.findIndex(r => r.room_id === id);
        if (index !== -1) {
            mockupRooms.splice(index, 1);
        }
    }
}

export default RoomService;