import { CheckCircle, XCircle, Box, Building2, DoorClosed, PhoneCall } from 'lucide-react';
import { IItem } from '@/types/item';

interface IProps {
    table: IItem
    phoneNo: string
    success: boolean
}

const ReservationResult = ({ table, phoneNo, success }: IProps) => {
    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                {success ? (
                    <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg">
                        <div className="flex items-center space-x-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <div>
                                <h2 className="text-2xl font-semibold text-green-600">
                                    Reservation Successful
                                </h2>
                                <p className="text-gray-600">
                                    You have successfully reserved this item
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t">
                            <h3 className="mb-4 text-lg font-medium">Item Details</h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Box className="w-5 h-5 mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Table Name</p>
                                        <p className="text-gray-600">{table.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Building2 className="w-5 h-5 mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Building</p>
                                        <p className="text-gray-600">
                                            {table.location.building.building_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <DoorClosed className="w-5 h-5 mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Room</p>
                                        <p className="text-gray-600">
                                            {table.location.room.room_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <PhoneCall className="w-5 h-5 mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-gray-600">
                                            {phoneNo}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-white rounded-lg shadow-lg">
                        <div className="flex items-center space-x-4">
                            <XCircle className="w-8 h-8 text-red-500" />
                            <div>
                                <h2 className="text-2xl font-semibold text-red-600">
                                    Item Already Reserved
                                </h2>
                                <p className="text-gray-600">
                                    This item is currently not available for reservation
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationResult
    ;