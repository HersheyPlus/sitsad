import { IForgot } from "@/types/forgot-item";
import TimeUtils from "@/utils/TimeUtils";
import { Card, Image } from "antd";
import { MapPin, DoorOpen } from "lucide-react"; // Import icons from lucide-react
import { CalendarOutlined, TableOutlined } from "@ant-design/icons"; // Import icons from Ant Design

interface IProps {
    item: IForgot;
    onSelect: (item: IForgot | null) => void;
}

const ForgotItem = ({ item, onSelect }: IProps) => {
    return (
        <Card
            key={item.id}
            hoverable
            cover={
                <Image
                    src={item.imageUrl}
                    alt={`Forgot Item ${item.id}`}
                    className="object-cover h-64"
                />
            }
            className="transition-shadow duration-300 bg-white shadow-md hover:shadow-lg"
        >
            <Card.Meta
                title={`Item #${item.id}`}
                description={
                    <div className="space-y-2" onClick={() => onSelect(item)}>
                        <p className="flex items-center text-blue-600">
                            <CalendarOutlined className="mr-2" />
                            Date: {TimeUtils.formatDate(item.date)}
                        </p>
                        <p className="flex items-center text-blue-600">
                            <TableOutlined className="mr-2" />
                            Table: {item.tableId}
                        </p>
                        <p className="flex items-center text-blue-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            Building: {item.buolding_name}
                        </p>
                        <p className="flex items-center text-blue-600">
                            <DoorOpen className="w-4 h-4 mr-2" />
                            Room: {item.room_name}
                        </p>
                    </div>
                }
            />
        </Card>
    );
};

export default ForgotItem;
