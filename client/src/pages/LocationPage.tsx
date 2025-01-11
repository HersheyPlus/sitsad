import LocationWrapper from '@/components/Shared/Location/admin/LocationWrapper'
import XBreadcrumb from '@/components/XBreadcrumb';
import { Flex } from 'antd'

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>,
    },
    {
        title: <a href="/dashboard">Dashboard</a>,
    },
    {
        title: 'Location',
    },
];

const LocationPage = () => {
    return (
        <Flex className="p-4" vertical gap={4}>
            <XBreadcrumb items={breadcrumbItems} />

            <LocationWrapper />
        </Flex>
    )
}

export default LocationPage