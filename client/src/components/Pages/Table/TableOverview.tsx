import { ITable, ITableHistory } from "@/types/table"
import { useEffect, useState } from "react";

interface IProps {
    table: ITable
}

// Predict ช่วงเวลาว่าเวลาไหนว่าง
// แสดงประวัติการใช้งาน
// แสดงข้อมูลโต๊ะ

const TableOverview = ({ table }: IProps) => {
    const [tableHistory, setTableHistory] = useState<ITableHistory[]>([]);

    useEffect(() => {
        doGetHistory();
    }, [table])

    const doGetHistory = () => {
        // fetch history by table id
        setTableHistory([
            {
                id: 1,
                tableId: 101,
                reservationTime: "2025-01-09 10:00 AM",
                leaveTime: "2025-01-09 12:00 PM",
                phoneNo: "1234567890",
            },
            {
                id: 2,
                tableId: 102,
                reservationTime: "2025-01-09 01:00 PM",
                leaveTime: "2025-01-09 03:00 PM",
                phoneNo: undefined,
            },
        ]);
    }

    return (
        <div>TableOverview</div>
    )
}

export default TableOverview