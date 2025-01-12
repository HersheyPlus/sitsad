import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider, Drawer, Button } from 'antd';
import {
    HomeOutlined,
    EnvironmentOutlined,
    UserOutlined,
    SettingOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import { ChartArea, Table, TableIcon as Toilet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [isDrawerVisible, setDrawerVisible] = useState(false);

    const sidebarTheme = {
        token: {
            colorPrimary: "#FFFFFF",
            colorBgContainer: "#1A1F37",
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

    const toggleDrawer = () => setDrawerVisible(!isDrawerVisible);

    return (
        <ConfigProvider theme={sidebarTheme}>
            {/* Fixed Sidebar for Larger Screens */}
            <Sider
                width={250}
                className="fixed top-0 left-0 hidden h-screen sm:block"
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

            {/* Drawer Sidebar for Smaller Screens */}
            <Drawer
                title={
                    <div className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="SIT Krana" className="w-7 h-7" />
                        <span className="text-lg font-medium text-white">SIT Krana</span>
                    </div>
                }
                placement="left"
                closable
                onClose={toggleDrawer}
                visible={isDrawerVisible}
                bodyStyle={{ padding: 0 }}
                drawerStyle={{ backgroundColor: '#1A1F37' }}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname.split('/').pop() || 'dashboard']}
                    defaultOpenKeys={['management', 'report']}
                    className="border-r-0"
                    items={menuItems}
                />
            </Drawer>

            {/* Hamburger Button for Smaller Screens */}
            <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleDrawer}
                className="fixed z-50 p-2 text-2xl text-white bg-blue-600 rounded sm:hidden top-4 left-4"
            />
        </ConfigProvider>
    );
};

export default Sidebar;
