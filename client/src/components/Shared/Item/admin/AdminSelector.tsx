import React, { useEffect } from 'react';
import { Select, Row, Col } from 'antd';
import { IBuilding, IRoom } from '@/types/location';
import XCollapse from '@/components/Shared/XCollapse';

const renderHeader = () => {
    return (
        <div>
            <h1>Filter Options</h1>
        </div>
    );
}

interface IProps {
    buildings: IBuilding[];
    rooms: IRoom[];
    selectedBuilding: IBuilding | undefined;
    selectedRoom: IRoom | undefined;
    onBuildingSelect: (building: IBuilding | undefined) => void;
    onRoomSelect: (room: IRoom | undefined) => void;
}

const AdminSelector: React.FC<IProps> = ({
    buildings,
    rooms,
    selectedBuilding,
    selectedRoom,
    onBuildingSelect,
    onRoomSelect
}) => {
    useEffect(() => {
        if (selectedBuilding && rooms.length === 0) {
            onRoomSelect(undefined);
        }
    }, [selectedBuilding, rooms, onRoomSelect]);

    const handleBuildingChange = (value: string) => {
        const building = buildings.find(b => b.building_id === value);
        if (building) {
            onBuildingSelect(building);
        }
    };

    const handleRoomChange = (value: string) => {
        const room = rooms.find(r => `${r.room_id}` === value);
        if (room) {
            onRoomSelect(room);
        }
    };

    return (
        <XCollapse title={renderHeader()}>
            <Row gutter={16}>
                <Col span={12}>
                    <Select
                        placeholder="Select Building"
                        style={{ width: '100%' }}
                        value={selectedBuilding ? selectedBuilding.building_id : undefined}
                        onChange={handleBuildingChange}
                    >
                        {buildings.map(building => (
                            <Select.Option key={building.building_id} value={building.building_id}>
                                {building.building_name}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col span={12}>
                    <Select
                        placeholder="Select Room"
                        style={{ width: '100%' }}
                        value={selectedRoom ? selectedRoom.room_id : undefined}
                        onChange={handleRoomChange}
                        disabled={!selectedBuilding}
                    >
                        {rooms.map(room => (
                            <Select.Option key={room.room_id} value={room.room_id}>
                                {room.room_name}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
            </Row>
        </XCollapse>
    );
};

export default AdminSelector;
