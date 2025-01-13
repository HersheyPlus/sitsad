import ToiletRoomList from '@/components/Pages/Toilet/ToiletRoomList';
import BuildingWrapper from '@/components/Shared/Location/BuildingWrapper';
import { ItemType } from '@/types/item';
import { useSearchParams } from 'react-router-dom';

const ToiletPage = () => {
    const [searchParams] = useSearchParams();

    const buildingId = searchParams.get("buildingId");

    if (buildingId) {
        return (
            <ToiletRoomList buildingId={buildingId} />
        )
    }

    return (
        <BuildingWrapper itemType={ItemType.TOILET} />
    )
}

export default ToiletPage