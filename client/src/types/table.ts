export interface ITable {
    id: number;
    x: number;
    y: number;
    available: boolean;
    width: number;
    height: number;
}

export interface ITableHistory {
    id: number;
    tableId: number;
    startDate: string;
    endDate: string;
}