import { IDevice } from "./device";
import { IBuilding, IRoom } from "./location";

export interface IItem {
    item_id: string;
    type: ItemType;
    building_id: string;
    available: boolean;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    floor?: number;
    name: string;
    device?: IDevice
    description?: string;
    location: {
        building: IBuilding;
        room: IRoom
    }

}

export interface IItemPayload {
    item_id?: string;
    type: ItemType;
    available: boolean;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    name: string;
    room_id: string;
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
    booking_time_period_id: string;
    item_id: string;
    room_id: string;
    started_booking_time: string;
    ended_booking_time: string;
    phoneNo?: string;
}

// export const ItemType = {
//     TABLE: 'Table',
//     TOILET: 'Toilet',
// }