import React from 'react';
import { Outlet } from "react-router-dom";
import { Layout } from 'antd';
import NotificationProvider from "../Shared/Provider/NotificationProvider";
import Sidebar from '../Shared/Sidebar';

const { Content } = Layout;

const AdminLayout: React.FC = () => {

    return (
        <Layout className="min-h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <Layout className="transition-all duration-300 sm:ml-[250px]">
                <NotificationProvider />
                <Content className="min-h-screen p-6">
                    <div className="bg-white rounded-lg min-h-[calc(100vh-48px)]">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout >)
}
export default AdminLayout;