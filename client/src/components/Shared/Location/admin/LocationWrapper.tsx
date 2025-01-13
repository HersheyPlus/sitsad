import BuildingWrapper from './building/BuildingWrapper';
import RoomWrapper from './room/RoomWrapper';
import XCollapse from '@/components/Shared/XCollapse';

const LocationWrapper = () => {

    return (
        <>
            <XCollapse title="Building Management">
                <BuildingWrapper />
            </XCollapse>

            <XCollapse title="Room Management">
                <RoomWrapper />
            </XCollapse>
        </>
    )
};

export default LocationWrapper;