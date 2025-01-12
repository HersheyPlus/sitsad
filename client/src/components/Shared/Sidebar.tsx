import React from 'react';
import { Layout, Menu, ConfigProvider } from 'antd';
import {
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    SettingOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import { ChartArea, Table, TableIcon as Toilet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
    const location = useLocation();

    const sidebarTheme = {
        token: {
            colorPrimary: "#FFFFFF",
            colorBgContainer: "#1A1F37", // Darker background to match design
            colorText: "#FFFFFF",
            colorTextSecondary: "#94A3B8",
            colorBgTextHover: "rgba(255, 255, 255, 0.08)",
            colorBgTextActive: "rgba(255, 255, 255, 0.12)",
            colorItemBgSelected: "rgba(59, 130, 246, 0.5)",
            colorItemBgHover: "rgba(255, 255, 255, 0.08)",
            fontFamily: "Poppins, sans-serif",
            borderRadius: 0,
        },
        components: {
            Menu: {
                itemSelectedColor: "#FFFFFF",
                itemSelectedBg: "#0066FF",
                subMenuItemBg: "#1A1F37",
                itemHeight: 40,
            }
        }
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <HomeOutlined />,
            label: <Link to="/dashboard">Dashboard</Link>,
        },
        {
            key: 'management',
            icon: <SettingOutlined />,
            label: 'Management',
            children: [
                {
                    key: 'location',
                    icon: <EnvironmentOutlined />,
                    label: <Link to="/dashboard/location">Location Management</Link>,
                },
                {
                    key: 'table',
                    icon: <Table className="w-4 h-4" />,
                    label: <Link to="/dashboard/table">Table Management</Link>,
                },
                {
                    key: 'toilet',
                    icon: <Toilet className="w-4 h-4" />,
                    label: <Link to="/dashboard/toilet">Toilet Management</Link>,
                },
            ],
        },
        {
            key: 'report',
            icon: <ChartArea className="w-4 h-4" />,
            label: 'Reports',
            children: [
                {
                    key: 'forgotten-items',
                    icon: <InboxOutlined />,
                    label: <Link to="/dashboard/forgotten-items">Forgotten Item Management</Link>,
                },
            ]
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to="/dashboard/profile">Profile</Link>,
        },
    ];

    return (
        <ConfigProvider theme={sidebarTheme}>
            <Sider
                width={250}
                className="fixed top-0 left-0 h-screen"
            >
                <div className="h-16 px-4 flex items-center bg-[#1A1F37] border-b border-gray-700">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="SIT Krana" className="w-7 h-7" />
                        <span className="text-lg font-medium text-white">SIT Krana</span>
                    </Link>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname.split('/').pop() || 'dashboard']}
                    defaultOpenKeys={['management', 'report']}
                    className="border-r-0 h-[calc(100vh-64px)]"
                    items={menuItems}
                />
            </Sider>
        </ConfigProvider>
    );
};

export default Sidebar;