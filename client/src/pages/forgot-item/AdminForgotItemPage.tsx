
import ForgotItemWrapper from '@/components/Pages/ForgotItem/admin/ForgotItemWrapper';
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
        title: 'Forgot Item',
    },
];

const AdminForgotItemPage = () => {
    return (
        <Flex className="p-4" vertical gap={4}>
            <XBreadcrumb items={breadcrumbItems} />

            <ForgotItemWrapper />
        </Flex>
    )
}

export default AdminForgotItemPage