import { IForgot } from "@/types/forgot-item"
import TimeUtils from "@/utils/TimeUtils"
import { Card } from "antd"

interface IProps {
    item: IForgot
}
const ForgotItem = ({ item }: IProps) => {
    return (
        <Card
            key={item.id}
            hoverable
            cover={<img alt={`Forgot item ${item.id}`} src={item.imageUrl} className="object-cover h-48" />}
            className="transition-shadow duration-300 bg-white shadow-md hover:shadow-lg"
        >
            <Card.Meta
                title={`Item #${item.id}`}
                description={
                    <div>
                        <p className="text-blue-600">Date: {TimeUtils.formatDate(item.date)}</p>
                        <p className="text-blue-600">Table: {item.tableId}</p>
                    </div>
                }
            />
        </Card>
    )
}

export default ForgotItem