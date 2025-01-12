import TableRoomList from '@/components/Pages/Table/TableRoomList';
import BuildingWrapper from '@/components/Shared/Location/BuildingWrapper';
import { ItemType } from '@/types/item';
import { useSearchParams } from 'react-router-dom';

const TablePage = () => {
    const [searchParams] = useSearchParams();

    const buildingId = searchParams.get("buildingId");

    if (buildingId) {
        return (
            <TableRoomList buildingId={buildingId}/>
        )
    }

    return (
        <BuildingWrapper itemType={ItemType.TABLE} />
    )
}

export default TablePage