import TableRoomList from '@/components/Pages/Table/TableRoomList';
import BuildingWrapper from '@/components/Shared/Location/BuildingWrapper';
import { ItemType } from '@/types/item';
import { useSearchParams } from 'react-router-dom';

const TablePage = () => {
    const [searchParams] = useSearchParams();

    const hasRoomId = searchParams.has("buildingId");

    if (hasRoomId) {
        return (
            <TableRoomList />
        )
    }

    return (
        <BuildingWrapper itemType={ItemType.TABLE} />
    )
}

export default TablePage