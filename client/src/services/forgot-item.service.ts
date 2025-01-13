import { IForgot } from "@/types/forgot-item";

const mockupForgotItems: IForgot[] = [{
    id: "1",
    imageUrl: "https://www.sit.kmutt.ac.th/wp-content/uploads/2023/08/275563700_10158910072508789_770337062821942139_n.jpg",
    date: "2025-10-10",
    tableId: "1",
    buolding_name: "SIT",
    room_name: "Room 1"
}, {
    id: "2",
    imageUrl: "https://www.sit.kmutt.ac.th/wp-content/uploads/2023/08/275563700_10158910072508789_770337062821942139_n.jpg",
    date: "2025-10-10",
    tableId: "2",
    buolding_name: "SIT",
    room_name: "Room 2"
}, {
    id: "3",
    imageUrl: "https://www.sit.kmutt.ac.th/wp-content/uploads/2023/08/275563700_10158910072508789_770337062821942139_n.jpg",
    date: "2025-10-10",
    tableId: "3",
    buolding_name: "SIT",
    room_name: "Room 3"
}, {
    id: "4",
    imageUrl: "https://www.sit.kmutt.ac.th/wp-content/uploads/2023/08/275563700_10158910072508789_770337062821942139_n.jpg",
    date: "2025-10-10",
    tableId: "4",
    buolding_name: "SIT",
    room_name: "Room 4"
}, {
    id: "5",
    imageUrl: "https://www.sit.kmutt.ac.th/wp-content/uploads/2023/08/275563700_10158910072508789_770337062821942139_n.jpg",
    date: "2025-10-10",
    tableId: "5",
    buolding_name: "SIT",
    room_name: "Room 5"
}]

const ForgotItemService = {

    async findAll(): Promise<IForgot[]> {
        return mockupForgotItems
    },

    async findById(id: string): Promise<IForgot | undefined> {
        return mockupForgotItems.find(item => item.id === id)
    },

    async findByDateRange(startTimeStamp: number, endTimeStamp: number): Promise<IForgot[]> {
        // Filter items based on date range using timestamps directly
        return mockupForgotItems.filter(item => {
            const date = new Date(item.date).getTime(); // Convert item date to timestamp
            return date >= startTimeStamp && date <= endTimeStamp; // Compare timestamps directly
        });
    },

    async create(item: IForgot): Promise<IForgot> {
        mockupForgotItems.push(item)
        return item
    },

    async update(item: IForgot): Promise<IForgot> {
        const index = mockupForgotItems.findIndex(i => i.id === item.id)
        mockupForgotItems[index] = item
        return item
    },

    async delete(id: string): Promise<void> {
        const index = mockupForgotItems.findIndex(i => i.id === id)
        mockupForgotItems.splice(index, 1)
    }
}

export default ForgotItemService
