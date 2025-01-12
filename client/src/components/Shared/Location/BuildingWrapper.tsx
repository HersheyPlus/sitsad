

import ItemFilter from '@/components/Shared/Item/ItemFilter';
import BuildingList from '@/components/Shared/Location/BuildingList';

import XBreadcrumb from '@/components/XBreadcrumb';
import BuildingService from '@/services/building.service';
import { ItemType } from '@/types/item';
import { IBuilding } from '@/types/location';
import { Flex, Typography } from 'antd';
import { useEffect, useState } from 'react';

import NotFoundPage from '../../../pages/NotFoundPage';
import { useNotificationStore } from '@/stores/notification.store';



const { Title } = Typography;

interface IProps {
    itemType: ItemType
}


const BuildingWrapper = ({ itemType }: IProps) => {
    const [query, setQuery] = useState("")
    const [buildings, setBuildings] = useState<IBuilding[]>([])
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )
    useEffect(() => {
        doSearch()
    }, [query])

    const doSearch = async () => {
        if (!itemType) return

        // Search using ItemType.Toilet
        try {
            const data = await BuildingService.findByKeywordAndItemType(query, itemType)
            setBuildings(data)
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }

    }

    const breadcrumbItems = [
        {
            title: <a href="/">Home</a>
        },
        {
            title: itemType.charAt(0).toUpperCase() + itemType.slice(1)
        }
    ];


    if (!itemType) {
        return <NotFoundPage />
    }

    return (
        <Flex vertical gap={4} className="p-4">
            <XBreadcrumb items={breadcrumbItems} />

            <ItemFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <Title level={2} className="mb-6">
                Available Building
            </Title>

            <BuildingList items={buildings} itemType={itemType} />
        </Flex>
    )
}

export default BuildingWrapper