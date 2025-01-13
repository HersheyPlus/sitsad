// src/services/BuildingService.ts
import { IBuilding } from "@/types/location";
import apiClient from './axios';

const BuildingService = {
    async findAll(): Promise<IBuilding[]> {
        try {
            const response = await apiClient.get('/buildings');
            return response.data;
        } catch (error) {
            console.error('Error fetching buildings:', error);
            throw error;
        }
    },

    async findById(id: string): Promise<IBuilding | undefined> {
        try {
            const response = await apiClient.get(`/buildings/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching building ${id}:`, error);
            throw error;
        }
    },

    async findByName(name: string): Promise<IBuilding | undefined> {
        try {
            const response = await apiClient.get(`/buildings/name/${name}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching building by name ${name}:`, error);
            throw error;
        }
    },

    async findByKeywordAndItemType(keyword: string, itemType: string): Promise<IBuilding[]> {
        try {
            const response = await apiClient.get('/buildings/search', {
                params: {
                    keyword: keyword || undefined,
                    itemType: itemType || undefined
                }
            });
            return response.data.data;
        } catch (error) {
            console.error(`Error searching buildings:`, error);
            throw error;
        }
    },

    async findByKeyword(keyword: string): Promise<IBuilding[]> {
        try {
            const response = await apiClient.get('/buildings/search', {
                params: { keyword }
            });
            return response.data.data;
        } catch (error) {
            console.error(`Error searching buildings with keyword ${keyword}:`, error);
            throw error;
        }
    },

    async create(building: IBuilding): Promise<void> {
        try {
            await apiClient.post('/buildings', building);
        } catch (error) {
            console.error('Error creating building:', error);
            throw error;
        }
    },

    async update(buildingId: string, building: IBuilding): Promise<void> {
        try {
            await apiClient.put(`/buildings/${buildingId}`, building);
        } catch (error) {
            console.error(`Error updating building ${buildingId}:`, error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            await apiClient.delete(`/buildings/${id}`);
        } catch (error) {
            console.error(`Error deleting building ${id}:`, error);
            throw error;
        }
    }
};

export default BuildingService;