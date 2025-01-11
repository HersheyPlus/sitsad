import { IItemHistory } from "@/types/item"
import { Card, Table, Typography } from "antd"

const { Title } = Typography

const historyColumns = [
    {
        title: 'Reservation Time',
        dataIndex: 'reservationTime',
        key: 'reservationTime',
        render: (text: string) => new Date(text).toLocaleString(),
    },
    {
        title: 'Leave Time',
        dataIndex: 'leaveTime',
        key: 'leaveTime',
        render: (text: string) => new Date(text).toLocaleString(),
    },
]

interface IProps {
    history: IItemHistory[]
}

const ItemUsageHistory = ({ history }: IProps) => {
    return (
        <Card title={<Title level={4}>Table Usage History</Title>} className="w-full">
            <Table dataSource={history} columns={historyColumns} rowKey="id" />
        </Card>
    )
}

export default ItemUsageHistory