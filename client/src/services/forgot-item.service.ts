// src/services/forgot-item.service.ts
import { IForgot } from '@/types/forgot-item';
import apiClient from './axios';

const ForgotItemService = {
    async findAll(): Promise<IForgot[]> {
        const response = await apiClient.get('/forgot-items');
        return response.data.data;
    },

    async findById(id: string): Promise<IForgot | undefined> {
        const response = await apiClient.get(`/forgot-items/${id}`);
        return response.data.data;
    },

    async findByDateRange(startTimeStamp: number, endTimeStamp: number): Promise<IForgot[]> {
        const startTime = new Date(startTimeStamp).toISOString();
        const endTime = new Date(endTimeStamp).toISOString();
        
        const response = await apiClient.get('/forgot-items/date-range', {
            params: {
                startTime,
                endTime
            }
        });
        return response.data.data;
    },

    async create(item: IForgot): Promise<IForgot> {
        const response = await apiClient.post('/forgot-items', item);
        return response.data.data;
    },

    async update(item: IForgot): Promise<void> {
        await apiClient.put(`/forgot-items/${item.id}`, item);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/forgot-items/${id}`);
    }
};

export default ForgotItemService;