// src/services/device.service.ts
import { IDevice } from '@/types/device';
import apiClient from './axios';

const DeviceService = {
    async findAll(): Promise<IDevice[]> {
        const response = await apiClient.get('/devices');
        return response.data.data;
    },

    async findById(id: string): Promise<IDevice | undefined> {
        const response = await apiClient.get(`/devices/${id}`);
        return response.data.data;
    },

    async findByKeyword(keyword: string): Promise<IDevice[]> {
        const response = await apiClient.get('/devices/search', {
            params: { keyword }
        });
        return response.data.data;
    },

    async findByTopic(topic: string): Promise<IDevice | undefined> {
        const response = await apiClient.get(`/devices/topic/${topic}`);
        return response.data.data;
    },

    async create(device: IDevice): Promise<IDevice> {
        const response = await apiClient.post('/devices', device);
        return response.data.data;
    },

    async update(device: IDevice): Promise<void> {
        await apiClient.put(`/devices/${device.id}`, device);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/devices/${id}`);
    }
};

export default DeviceService;