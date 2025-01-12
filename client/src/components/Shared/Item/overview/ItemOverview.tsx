"use client"

import { IItem, IItemHistory } from "@/types/item"
import { useEffect, useState } from "react"

import ItemInfo from "./ItemInfo"
import ItemPrediction from "./ItemPrediction"
import ItemUsageHistory from "./ItemUsageHistory"
import HistoryService from "@/services/history.service"
import { useNotificationStore } from "@/stores/notification.store"

interface IProps {
    item: IItem | null
    roomId?: string
    itemName: string
}

const ItemOverview = ({ item, itemName, roomId }: IProps) => {
    const [history, setHistory] = useState<IItemHistory[]>([])
        const openNotification = useNotificationStore(
            (state) => state.openNotification
        )


    useEffect(() => {
        doGetHistory()
    }, [item])

    const doGetHistory = async () => {
        if (!roomId) return
        try {
            if (!item) {
                const data = await HistoryService.findByRoomId(roomId)
                setHistory(data)
                return
            }
            const data = await HistoryService.findByItemId(item.item_id)
            setHistory(data)
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    
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

