import React, { useEffect } from 'react';
import { ConfigProvider, Layout, Menu } from 'antd';
import { Flex } from 'antd';
import { useLocation, Link } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const headerStyle = {
    token: {
        colorPrimary: "#FFFFFF",
        colorBgBase: "#FFFFFF",
        colorBgSecondary: "#8bbbff",
        colorText: "#000000",
        colorLink: "#1E90FF",
        colorLinkHover: "#4682B4",
        borderRadius: 4,
        fontFamily: "Poppins, sans-serif",
    },
};

const items = [
    { label: 'Home', href: "/" },
    { label: 'Table', href: "/table" },
    { label: 'Toilet', href: "/toilet" },
];

const Header: React.FC = () => {
    const location = useLocation();
    const [selectedKey, setSelectedKey] = React.useState('1');


    useEffect(() => {
        const currentPath = location.pathname;
        const currentIndex = items.findIndex(item => item.href === currentPath);
        if (currentIndex !== -1) {
            setSelectedKey(`${currentIndex + 1}`);
        }
    }, [location.pathname]);

    return (
        <AntHeader className="flex items-center justify-between bg-blue-600 shadow-xl">
            <a href="/">
                <Flex align='center' gap={8}>
                    <img src="/assets/logo.png" alt="SIT Krana" className="w-auto h-12" />
                    <div className="hidden font-bold text-white sm:block sm:text-2xl">SIT Krana</div>
                </Flex>
            </a>
            <ConfigProvider theme={headerStyle}>
                <Menu
                    mode="horizontal"
                    selectedKeys={[selectedKey]}
                    className="bg-blue-600 !text-sm sm:text-base"
                >
                    {items.map((item, index) => (
                        <Menu.Item key={index + 1}>
                            <Link to={item.href}>{item.label}</Link>
                        </Menu.Item>
                    ))}
                </Menu>
            </ConfigProvider>
        </AntHeader>
    );
};

export default Header;
