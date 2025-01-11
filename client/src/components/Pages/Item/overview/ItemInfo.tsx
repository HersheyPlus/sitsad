import { IItem } from "@/types/item"
import { EnvironmentOutlined } from "@ant-design/icons"
import { Badge, Card, Typography } from "antd"
import { Info } from "lucide-react"

const { Title, Text } = Typography

interface IProps {
    data: IItem
    itemName: string
}

const ItemInfo = ({ data, itemName }: IProps) => {
    return (
        <Card title={<Title level={4} className="flex items-center gap-2">
            <Info /> Information
        </Title>} className="w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Text strong>{itemName} ID: {data.id}</Text>
                    <br />
                    <Text>Name: {data.name || 'N/A'}</Text>
                    <br />
                    <Text>Description: {data.description || 'N/A'}</Text>
                </div>
                <div>
                    <Text>Size: {data.width}x{data.height}</Text>
                    <br />
                    <Text>
                        <EnvironmentOutlined className="mr-2" />
                        Location: {data?.location?.title}
                    </Text>
                    <br />
                    <Text>
                        Status: <Badge status={data.available ? "success" : "error"} text={data.available ? 'Available' : 'Occupied'} />
                    </Text>
                </div>
            </div>
        </Card>
    )
}

export default ItemInfo