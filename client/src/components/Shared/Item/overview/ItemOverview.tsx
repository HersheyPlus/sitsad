"use client"

import { IItem, IItemHistory } from "@/types/item"
import { useEffect, useState } from "react"

import ItemInfo from "./ItemInfo"
import ItemPrediction from "./ItemPrediction"
import ItemUsageHistory from "./ItemUsageHistory"

interface IProps {
    item: IItem
    itemName: string
}

const mockupHistory: IItemHistory[] = [
    {
        id: 1,
        itemId: 101,
        started_booking_time: "2025-01-09 10:00 AM",
        ended_booking_time: "2025-01-09 12:00 PM",
    },
    {
        id: 2,
        itemId: 102,
        started_booking_time: "2025-01-09 01:00 PM",
        ended_booking_time: "2025-01-09 03:00 PM",
    },
]

const ItemOverview = ({ item, itemName }: IProps) => {
    const [history, setHistory] = useState<IItemHistory[]>(mockupHistory)

    useEffect(() => {
        doGetHistory()
    }, [item])

    const doGetHistory = () => {
        // fetch history by table id
        setHistory([
            {
                id: 1,
                itemId: 101,
                started_booking_time: "2025-01-09 10:00 AM",
                ended_booking_time: "2025-01-09 12:00 PM",
                phoneNo: "1234567890",
            },
            {
                id: 2,
                itemId: 102,
                started_booking_time: "2025-01-09 01:00 PM",
                ended_booking_time: "2025-01-09 03:00 PM",
                phoneNo: undefined,
            },

            {
                id: 3,
                itemId: 103,
                started_booking_time: "2025-01-09 10:00 AM",
                ended_booking_time: "2025-01-09 12:00 PM",
                phoneNo: "1234567890",
            },
        ])
    }

    return (
        <div className="space-y-6">
            <ItemInfo data={item} itemName={itemName} />

            <ItemPrediction history={history} />

            <ItemUsageHistory history={history} />
        </div>
    )
}

export default ItemOverview

