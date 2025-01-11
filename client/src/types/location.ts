export interface IBuilding {
    building_id: number;
    building_name: string;
    description?: string;
    imageURL?: string;
    // limitFloor: number;
}

export interface IRoom {
    room_id: string;
    building_id: number
    room_name: string;
    description: string;
    imageURL: string;
    floor?: number;
}
