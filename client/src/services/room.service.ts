// src/services/RoomService.ts
import { IRoom } from "@/types/location";
import apiClient from './axios';

const RoomService = {
    async findAll(): Promise<IRoom[]> {
        const response = await apiClient.get('/rooms');
        return response.data.data;
    },

    // async findById(id: string): Promise<IRoom | undefined> {
    //     const response = await apiClient.get(`/rooms/${id}`);
    //     return response.data;
    // },

    async findByBuildingId(building_id: string): Promise<IRoom[]> {
        const response = await apiClient.get(`/rooms/building/${building_id}`);
        return response.data;
    },

    async findByName(name: string): Promise<IRoom | undefined> {
        const response = await apiClient.get(`/rooms/name/${name}`);
        return response.data;
    },

    async findByKeyword(keyword: string): Promise<IRoom[]> {
        if (!keyword) return this.findAll();

        const data = await this.findAll();

        // TOFIX: Implement a better search algorithm in server
        return data.filter((room) => {
            return room.room_name.toLowerCase().includes(keyword.toLowerCase());
        });

    },

    async findByKeywordAndItemType(keyword: string, buildingId: string, itemType: string): Promise<IRoom[]> {
        const response = await apiClient.get('/rooms/search', {
            params: { keyword, itemType, buildingId }
        });
        return response.data.data;
    },

    async create(room: IRoom): Promise<IRoom> {
        const response = await apiClient.post('/rooms', room);
        return response.data;
    },

    async update(roomId: string, room: IRoom): Promise<void> {
        await apiClient.put(`/rooms/${roomId}`, room);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/rooms/${id}`);
    }
};

export default RoomService;