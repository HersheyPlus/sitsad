import Dashboard from '@/components/Pages/Dashboard/Dashboard';
import XBreadcrumb from '@/components/XBreadcrumb';
import { Flex } from 'antd';

const breadcrumbItems = [
    {
        title: <a href="/">Home</a>,
    },
    {
        title: 'Dasbhoard',
    },
];


export default function DashboardPage() {
    return (
        <Flex vertical gap={4} className='min-h-screen p-8 bg-gray-100'>
            <XBreadcrumb items={breadcrumbItems} />

            <Dashboard />
        </Flex>
    )
}