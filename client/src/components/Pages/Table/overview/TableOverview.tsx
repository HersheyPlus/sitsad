"use client"

import { ITable, ITableHistory } from "@/types/table"
import { useEffect, useState } from "react"
import TableInfo from "./TableInfo"
import TablePrediction from "./TablePrediction"
import TableUsageHistory from "./TableUsageHistory"


interface IProps {
    table: ITable
}

const data: ITableHistory[] = [
    {
        id: 1,
        tableId: 101,
        reservationTime: "2025-01-09 10:00 AM",
        leaveTime: "2025-01-09 12:00 PM",
    },
    {
        id: 2,
        tableId: 102,
        reservationTime: "2025-01-09 01:00 PM",
        leaveTime: "2025-01-09 03:00 PM",
    },
]

const TableOverview: React.FC<IProps> = ({ table }) => {
    const [tableHistory, setTableHistory] = useState<ITableHistory[]>(data)

    useEffect(() => {
        doGetHistory()
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

            {
                id: 3,
                tableId: 1031,
                reservationTime: "2025-01-09 10:00 AM",
                leaveTime: "2025-01-09 12:00 PM",
                phoneNo: "1234567890",
            },
        ])
    }

    return (
        <div className="space-y-6">

            <TableInfo table={table} />

            <TablePrediction tableHistory={tableHistory} />

            <TableUsageHistory tableHistory={tableHistory} />
        </div>
    )
}

export default TableOverview

