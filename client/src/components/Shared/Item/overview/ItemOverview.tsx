"use client"

import { IItem, IItemHistory } from "@/types/item"
import { useEffect, useState } from "react"

import ItemInfo from "./ItemInfo"
import ItemPrediction from "./ItemPrediction"
import ItemUsageHistory from "./ItemUsageHistory"
import HistoryService from "@/services/history.service"

interface IProps {
    item: IItem | null
    roomId?: string
    itemName: string
}

const ItemOverview = ({ item, itemName, roomId }: IProps) => {
    const [history, setHistory] = useState<IItemHistory[]>([])

    useEffect(() => {
        doGetHistory()
    }, [item])

    const doGetHistory = async () => {
        if (!roomId) return

        if (!item) {
            const data = await HistoryService.findByRoomId(roomId)
            setHistory(data)
            return
        }
        // fetch history by table id
        const data = await HistoryService.findByItemId(item.item_id)
        setHistory(data)
    }

    return (
        <div className="space-y-6">
            {
                item && (
                    <ItemInfo data={item} itemName={itemName} />
                )
            }

            <ItemPrediction history={history} />

            <ItemUsageHistory history={history} />
        </div>
    )
}

export default ItemOverview

