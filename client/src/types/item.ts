import { ILocation } from "./location";

export interface IItem {
    id: number;
    x: number;
    y: number;
    available: boolean;
    name: string;
    description?: string;
    width: number;
    height: number;
    location?: ILocation

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Add this line
}

export interface IItemHistory {
    id: number;
    itemId: number;
    reservationTime: string;
    leaveTime: string;
    phoneNo?: string;
}

export const ItemType = {
    TABLE: 'Table',
    TOILET: 'Toilet',
}