// src/services/TableService.ts
import { IItem, IItemPayload } from "@/types/item";
import apiClient from './axios';

const TableService = {
    // async findAll(): Promise<IItem[]> {
    //     const response = await apiClient.get('/tables');
    //     return response.data;
    // },

    // TODO: New routes
    async findById(id: string): Promise<IItem | undefined> {
        const response = await apiClient.get(`/tables/${id}`);
        return response.data;
    },

    async findByRoomId(roomId: string): Promise<IItem[]> {
        const response = await apiClient.get(`/tables/room/${roomId}`);
        return response.data.data;
    },

    async findByKeyword(keyword: string): Promise<IItem[]> {
        const response = await apiClient.get('/tables/search', {
            params: { keyword }
        });
        return response.data;
    },

    async findByName(name: string): Promise<IItem | undefined> {
        const response = await apiClient.get(`/tables/name/${name}`);
        return response.data;
    },

    async create(table: IItemPayload): Promise<IItem> {
        const response = await apiClient.post('/tables', table);
        return response.data;
    },

    async update(table: IItemPayload): Promise<void> {
        await apiClient.put(`/tables/${table.item_id}`, table);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/items/${id}`);
    }
};

export default TableService;