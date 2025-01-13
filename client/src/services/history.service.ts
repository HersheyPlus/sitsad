// src/services/HistoryService.ts
import { IItemHistory } from "@/types/item";
import apiClient from './axios';

const HistoryService = {
    // async findAll(roomId: string): Promise<IItemHistory[]> {
    //     try {
    //         const response = await apiClient.get(`/histories/${roomId}`);
    //         return response.data.data;
    //     } catch (error) {
    //         console.error('Error fetching histories:', error);
    //         throw error;
    //     }
    // },
    async findByRoomId(roomId: string): Promise<IItemHistory[]> {
        try {
            const response = await apiClient.get(`/histories/${roomId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching histories:', error);
            throw error;
        }
    },

    async findById(id: string): Promise<IItemHistory | undefined> {
        try {
            const response = await apiClient.get(`/histories/id/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching history ${id}:`, error);
            throw error;
        }
    },

    async findByItemId(itemId: string): Promise<IItemHistory[]> {
        try {
            const response = await apiClient.get(`/histories/item/${itemId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching histories for item ${itemId}:`, error);
            throw error;
        }
    },

    async create(history: IItemHistory): Promise<void> {
        try {
            await apiClient.post('/histories', history);
        } catch (error) {
            console.error('Error creating history:', error);
            throw error;
        }
    },

    async update(id: string, history: IItemHistory): Promise<void> {
        try {
            await apiClient.put(`/histories/${id}`, history);
        } catch (error) {
            console.error(`Error updating history ${id}:`, error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(`/histories/${id}`);
        } catch (error) {
            console.error(`Error deleting history ${id}:`, error);
            throw error;
        }
    }
};

export default HistoryService;