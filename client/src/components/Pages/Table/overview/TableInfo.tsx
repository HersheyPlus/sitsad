import { ITable } from "@/types/table"
import { EnvironmentOutlined } from "@ant-design/icons"
import { Badge, Card, Typography } from "antd"
import { Info } from "lucide-react"

const { Title, Text } = Typography

interface IProps {
    table: ITable
}

const TableInfo = ({ table }: IProps) => {
    return (
        <Card title={<Title level={4} className="flex items-center gap-2">
            <Info /> Information
        </Title>} className="w-full">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Text strong>Table ID: {table.id}</Text>
                    <br />
                    <Text>Name: {table.name || 'N/A'}</Text>
                    <br />
                    <Text>Description: {table.description || 'N/A'}</Text>
                </div>
                <div>
                    <Text>Size: {table.width}x{table.height}</Text>
                    <br />
                    <Text>
                        <EnvironmentOutlined className="mr-2" />
                        Location: {table?.location?.title}
                    </Text>
                    <br />
                    <Text>
                        Status: <Badge status={table.available ? "success" : "error"} text={table.available ? 'Available' : 'Occupied'} />
                    </Text>
                </div>
            </div>
        </Card>
    )
}

export default TableInfo