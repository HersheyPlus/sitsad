
import XBreadcrumb from "@/components/Shared/XBreadcrumb"
import { Flex, Typography } from "antd"
import { useEffect, useState } from "react"
import { useNotificationStore } from "@/stores/notification.store"
import ForgotItemService from "@/services/forgot-item.service"
import ForgotItemList from "@/components/Pages/ForgotItem/ForgotItemList"
import { IForgot } from "@/types/forgot-item"
import ForgotItemFilter from "@/components/Pages/ForgotItem/ForgotItemFilter"
import { Dayjs } from "dayjs"
import ForgotItemModal from "@/components/Pages/ForgotItem/ForgotItemModal"

const { Title } = Typography

const ForgotItemPage = () => {
    const [selectedDate, setSelectedDate] = useState<[Dayjs, Dayjs] | null>(null)
    const [selectedItem, setSelectedItem] = useState<IForgot | null>(null)
    const [forgotItems, setForgotItems] = useState<IForgot[]>([])
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        doSearch()
    }, [selectedDate])

    const doSearch = async () => {
        console.log("Date:", selectedDate)

        const [startDate, endDate] = selectedDate || [null, null]

        if (!startDate || !endDate) {
            const data = await ForgotItemService.findAll()
            setForgotItems(data)

            return
        }


        try {
            const data = await ForgotItemService.findByDateRange(startDate.toDate().getTime(), endDate.toDate().getTime())
            setForgotItems(data)
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }
    }

    const doCloseModal = () => {
        setSelectedItem(null)
    }

    const breadcrumbItems = [
        {
            title: <a href="/">Home</a>
        },
        {
            title: "Forgot Items"
        }
    ];

    return (
        <Flex vertical gap={4} className="p-4">
            <XBreadcrumb items={breadcrumbItems} />

            <ForgotItemFilter doChangeQuery={setSelectedDate} doSearch={doSearch} />

            <Title level={2} className="mb-6">
                Forgot Items
            </Title>

            <ForgotItemList items={forgotItems} onSelect={setSelectedItem} />

            {
                selectedItem && (
                    <ForgotItemModal selectedItem={selectedItem} onClose={doCloseModal} />
                )
            }

        </Flex>
    )
}

export default ForgotItemPage