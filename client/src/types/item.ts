import { IBuilding, IRoom } from "./location";

export interface IItem {
    item_id: number;
    type: ItemType;
    building_id: number;
    available: boolean;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    floor?: number;
    name: string;
    description?: string;
    location: {
        building: IBuilding;
        room: IRoom
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Add this line
}

export enum ItemType {
    TABLE = 'table',
    TOILET = 'toilet',
}

export enum Gender {
    Female = 'female',
    Male = 'Male'
}

export interface IItemHistory {
    id: number;
    itemId: number;
    started_booking_time: string;
    ended_booking_time: string;
    phoneNo?: string;
}

// export const ItemType = {
//     TABLE: 'Table',
//     TOILET: 'Toilet',
// }