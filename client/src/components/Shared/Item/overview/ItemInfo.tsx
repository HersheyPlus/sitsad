import { IItem } from "@/types/item";
import { EnvironmentOutlined, FileTextOutlined, AppstoreAddOutlined, InfoCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { Badge, Card, Typography } from "antd";


const { Title, Text } = Typography;

interface IProps {
    data: IItem;
    itemName: string;
}

const ItemInfo = ({ data, itemName }: IProps) => {
    return (
        <Card
            title={
                <Title level={4} className="flex items-center gap-2">
                    <InfoCircleOutlined /> Information
                </Title>
            }
            className="w-full"
        >
            <div className="grid grid-cols-1 gap-4 text-base md:grid-cols-2">
                {/* Left Column */}
                <div>
                    <Text strong>{itemName} ID: {data.item_id}</Text>
                    <br />
                    <Text>
                        <FileTextOutlined className="mr-2" />
                        Name: {data.name || 'N/A'}
                    </Text>
                    <br />
                    <Text>
                        <InboxOutlined className="mr-2" />
                        Description: {data.description || 'N/A'}
                    </Text>
                </div>

                {/* Right Column */}
                <div>
                    <Text>
                        <AppstoreAddOutlined className="mr-2" />
                        Size: {data.width}x{data.height}
                    </Text>
                    <br />
                    <Text>
                        <EnvironmentOutlined className="mr-2" />
                        Building: {data.location.building.building_name}
                    </Text>
                    <br />
                    <Text>
                        <EnvironmentOutlined className="mr-2" />
                        Room: {data.location.room.room_name}
                    </Text>
                    <br />
                    <Text>
                        <Badge status={data.available ? "success" : "error"} text={data.available ? 'Available' : 'Occupied'} />
                    </Text>
                </div>
            </div>
        </Card>
    );
};

export default ItemInfo;
