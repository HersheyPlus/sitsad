import { IItemHistory } from "@/types/item";

const mockupHistory: IItemHistory[] = [
    {
        id: "1",
        item_id: "1",
        room_id: "1",
        started_booking_time: "2025-01-09 10:00 AM",
        ended_booking_time: "2025-01-09 12:00 PM",
        phoneNo: "1234567890",
    },
    {
        id: "2",
        item_id: "1",
        room_id: "2",
        started_booking_time: "2025-01-09 01:00 PM",
        ended_booking_time: "2025-01-09 03:00 PM",
        phoneNo: undefined,
    },
];

const HistoryService = {
    findAll() {
        return mockupHistory;
    },

    async findById(id: string) {
        return mockupHistory.find(history => history.id === id);
    },

    async findByItemId(item_id: string) {
        return mockupHistory.filter(history => history.item_id === item_id);
    },

    async findByRoomId(roomId: string) {
        return mockupHistory.filter(history => history.room_id.toString().startsWith(roomId));
    },

    async create(history: IItemHistory) {
        mockupHistory.push(history);
    },

    async delete(id: string) {
        const index = mockupHistory.findIndex(h => h.id === id);
        if (index !== -1) {
            mockupHistory.splice(index, 1);
        }
    }
}

export default HistoryService