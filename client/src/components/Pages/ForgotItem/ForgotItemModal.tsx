import { IForgot } from "@/types/forgot-item";
import TimeUtils from "@/utils/TimeUtils";
import { Modal, Typography } from "antd";

const { Text } = Typography;

interface IProps {
    selectedItem: IForgot;
    onClose: () => void;
}

const ForgotItemModal = ({ selectedItem, onClose }: IProps) => {
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
                <div className="text-center">
                    <Text
                        strong
                        className="mb-2 mr-2 text-xl text-blue-900"
                    >
                        Date:
                    </Text>
                    <Text className="text-lg text-blue-700">
                        {TimeUtils.formatDate(selectedItem.date)}
                    </Text>
                </div>
                {/* Item Table ID */}
                <div className="text-center">
                    <Text
                        strong
                        className="mb-2 text-xl text-blue-900"
                    >
                        Table:
                    </Text>
                    <Text className="mr-2 text-lg text-blue-700">
                        {selectedItem.tableId}
                    </Text>
                </div>
            </div>
        </Modal>
    )
}

export default ForgotItemModal;
