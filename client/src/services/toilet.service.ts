// src/services/ToiletService.ts
import { IItem, IItemPayload } from "@/types/item";
import apiClient from './axios';

const ToiletService = {

    async findById(id: string): Promise<IItem | undefined> {
        const response = await apiClient.get(`/toilets/${id}`);
        return response.data;
    },

    async findByRoomId(room_id: string): Promise<IItem[]> {
        const response = await apiClient.get(`/toilets/room/${room_id}`);
        return response.data.data;
    },

    async findByName(name: string): Promise<IItem | undefined> {
        const response = await apiClient.get(`/toilets/name/${name}`);
        return response.data;
    },

    async create(toilet: IItem | IItemPayload): Promise<IItem> {
        const response = await apiClient.post('/toilets', toilet);
        return response.data;
    },

    async update(toilet: IItem): Promise<void> {
        await apiClient.put(`/toilets/${toilet.item_id}`, toilet);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/items/${id}`);
    }
};

export default ToiletService;