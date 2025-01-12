import ToiletRoomList from '@/components/Pages/Toilet/ToiletRoomList';
import BuildingWrapper from '@/components/Shared/Location/BuildingWrapper';
import { ItemType } from '@/types/item';
import { useSearchParams } from 'react-router-dom';

const ToiletPage = () => {
    const [searchParams] = useSearchParams();

    const hasRoomId = searchParams.has("buildingId");

    if (hasRoomId) {
        return (
            <ToiletRoomList />
        )
    }

    return (
        <BuildingWrapper itemType={ItemType.TOILET} />
    )
}

export default ToiletPage