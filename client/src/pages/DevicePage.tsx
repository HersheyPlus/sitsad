
import DeviceWrapper from '@/components/Shared/Device/DeviceWrapper';
import XBreadcrumb from '@/components/Shared/XBreadcrumb';
import { Flex } from 'antd'

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>,
    },
    {
        title: <a href="/dashboard">Dashboard</a>,
    },
    {
        title: 'Device',
    },
];

const DevicePage = () => {
    return (
        <Flex className="p-4" vertical gap={4}>
            <XBreadcrumb items={breadcrumbItems} />

            <DeviceWrapper />
        </Flex>
    )
}

export default DevicePage