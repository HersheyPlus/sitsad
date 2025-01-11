import { ILocation } from "./location";

export interface ITable {
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

export interface ITableHistory {
    id: number;
    tableId: number;
    reservationTime: string;
    leaveTime: string;
    phoneNo?: string;
}