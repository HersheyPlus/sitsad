export interface ITable {
    id: number;
    x: number;
    y: number;
    available: boolean;
    description?: string;
    width: number;
    height: number;
}

export interface ITableHistory {
    id: number;
    tableId: number;
    reservationTime: string;
    leaveTime: string;
    phoneNo?: string;
}