import { useState } from 'react';
import { CheckCircle, XCircle, Box, Building2, DoorClosed } from 'lucide-react';
import { useParams } from 'react-router-dom';

const ReservationPage = () => {
    // @ts-ignore
    const { tableId } = useParams<{ tableId: string }>();

    // @ts-ignore
    const doReservation = async () => {
        // Call API to reserve the item
    }
    // Mock data for demonstration
    const [reservationStatus] = useState({
        success: true,
        item: {
            item_id: "item123",
            type: "EQUIPMENT",
            available: true,
            position_x: 100,
            position_y: 200,
            width: 50,
            height: 50,
            name: "Projector XD-1000",
            description: "4K Projector for presentations",
            location: {
                building: {
                    building_id: "bld1",
                    building_name: "Engineering Building"
                },
                room: {
                    room_id: "rm101",
                    room_name: "Conference Room A",
                    description: "Main conference room",
                    floor: 1
                }
            }
        }
    });

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                {reservationStatus.success ? (
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
                                        <p className="text-gray-600">{reservationStatus.item.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Building2 className="w-5 h-5 mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Building</p>
                                        <p className="text-gray-600">
                                            {reservationStatus.item.location.building.building_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <DoorClosed className="w-5 h-5 mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Room</p>
                                        <p className="text-gray-600">
                                            {reservationStatus.item.location.room.room_name}
                                        </p>
                                    </div>
                                </div>

                                {/* <div className="flex items-start space-x-3">
                                    <MapPin className="w-5 h-5 mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-medium">Floor</p>
                                        <p className="text-gray-600">
                                            Floor {reservationStatus.item.location.room.floor}
                                        </p>
                                    </div>
                                </div> */}
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

export default ReservationPage;