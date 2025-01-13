import { useNotificationStore } from "@/stores/notification.store";
import { IForgot } from "@/types/forgot-item";
import TimeUtils from "@/utils/TimeUtils";
import { CalendarOutlined, TableOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { DoorOpen, MapPin } from "lucide-react";

interface IProps {
    selectedItem: IForgot;
    onClose: () => void;
}

const ForgotItemModal = ({ selectedItem, onClose }: IProps) => {
    const openNotification = useNotificationStore((state) => state.openNotification);

    const doContact = () => {
        openNotification({
            message: "Contact Information",
            description: `If you are owner of this item, please contact the front desk to claim it.`,
            type: "info",
        });
    }

    return (
        <Modal
            title={selectedItem ? `Details for Item #${selectedItem.id}` : ''}
            visible={!!selectedItem}
            onCancel={onClose}
            footer={null}
            className="max-w-lg mx-auto bg-white rounded-lg shadow-xl"
            centered
        >
            <div className="flex flex-col items-center space-y-6">
                {/* Item Image */}
                <img
                    src={selectedItem.imageUrl}
                    alt={`Forgot item ${selectedItem.id}`}
                    className="object-cover w-full h-64 shadow-md rounded-xl"
                />
                {/* Item Date */}
                <div className="flex flex-col items-center justify-between w-full sm:flex-row sm:gap-4">
                    <div className="w-full text-start">
                        <p className="flex items-center text-blue-600">
                            <CalendarOutlined className="mr-2" />
                            Date: {TimeUtils.formatDate(selectedItem.date)}
                        </p>
                        <p className="flex items-center text-blue-600">
                            <TableOutlined className="mr-2" />
                            Table: {selectedItem.tableId}
                        </p>
                    </div>
                    <div className="w-full text-end">
                        <p className="flex items-center text-blue-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            Building: {selectedItem.building_name || "LX Learning Center"}
                        </p>
                        <p className="flex items-center text-blue-600">
                            <DoorOpen className="w-4 h-4 mr-2" />
                            Room: {selectedItem.room_name || "LX Learning Garden"}
                        </p>
                    </div>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={doContact}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700"
                >
                    Click to contact
                </Button>
            </div>
        </Modal>
    )
}

export default ForgotItemModal;
