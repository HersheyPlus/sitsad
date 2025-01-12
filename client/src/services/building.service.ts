import { IBuilding } from "@/types/location";

export const mockupBuildings: IBuilding[] = [{
    building_id: "1",
    building_name: "LX Building",
    description: "Kmutt Building LX built in 2023",
    imageURL: "https://www.lib.kmutt.ac.th/wp-content/uploads/2023/03/Pic-main-1.jpg"
}, {
    building_id: "2",
    building_name: "SIT Building",
    description: "Kmutt Building SIT built in 2023",
    imageURL: "https://www.sit.kmutt.ac.th/wp-content/uploads/2023/08/275563700_10158910072508789_770337062821942139_n.jpg"
}, {
    building_id: "3",
    building_name: "CB 2 Building",
    description: "Kmutt Building CB 2 built in 2023",
}]

const BuildingService = {

    async findAll() {
        return mockupBuildings;
    },

    async findById(id: string) {
        return mockupBuildings.find(building => building.building_id === id);
    },

    async findByName(name: string) {
        return mockupBuildings.find(building => building.building_name === name);
    },

    async findByItemType(itemType: string) {
        return mockupBuildings
    },

    async findByKeyword(keyword: string) {
        if (!keyword) return mockupBuildings;

        return mockupBuildings.filter(building => building.building_name.toLowerCase().includes(keyword.toLowerCase()));
    },

    async findByKeywordAndItemType(keyword: string, itemType: string) {
        if (!keyword) return mockupBuildings;

        return mockupBuildings.filter(building => building.building_name.includes(keyword));
    },

    async create(building: IBuilding) {
        mockupBuildings.push(building);
    },

    async update(buildingId: string, building: IBuilding) {
        const index = mockupBuildings.findIndex(b => b.building_id === building.building_id);
        if (index !== -1) {
            mockupBuildings[index] = building;
        }
    },

    async delete(id: string) {
        const index = mockupBuildings.findIndex(b => b.building_id === id);
        if (index !== -1) {
            mockupBuildings.splice(index, 1);
        }
    }
}

export default BuildingService