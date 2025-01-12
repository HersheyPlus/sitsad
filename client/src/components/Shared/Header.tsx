import React, { useEffect } from 'react';
import { ConfigProvider, Layout, Menu, Drawer, Button } from 'antd';
import { Flex } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const headerStyle = {
    token: {
        colorText: "#FFFFFF",
        borderRadius: 8,
    },
    components: {
        Menu: {
            itemSelectedColor: "#FFFFFF",
            itemSelectedBg: "#8bbbff",
            subMenuItemBg: "#1A1F37",
            itemHeight: 40,
        }
    }
};

// const headerStyle = {
//     token: {
//         colorPrimary: "#FFFFFF",
//         colorBgBase: "#FFFFFF",
//         colorBgSecondary: "#8bbbff",
//         colorText: "#000000",
//         colorLink: "#1E90FF",
//         colorLinkHover: "#4682B4",
//         borderRadius: 4,
//         fontFamily: "Poppins, sans-serif",
//     },
// };

const items = [
    { label: 'Home', href: "/" },
    { label: 'Table', href: "/table" },
    { label: 'Toilet', href: "/toilet" },
    { label: 'Dashboard', href: "/dashboard" },
];

const Header: React.FC = () => {
    const location = useLocation();
    const [selectedKey, setSelectedKey] = React.useState('1');
    const [visible, setVisible] = React.useState(false);

    useEffect(() => {
        const currentPath = location.pathname;
        const currentIndex = items.findIndex(item => item.href === currentPath);
        if (currentIndex !== -1) {
            setSelectedKey(`${currentIndex + 1}`);
        }
    }, [location.pathname]);

    const showDrawer = () => {
        setVisible(true);
    };

    const closeDrawer = () => {
        setVisible(false);
    };

    return (
        <AntHeader className="flex items-center justify-between bg-blue-600 shadow-xl">
            <a href="/">
                <Flex align='center' gap={8}>
                    <img src="/assets/logo.png" alt="SIT Krana" className="w-auto h-12" />
                    <div className="font-bold text-white sm:block sm:text-2xl">SIT Krana</div>
                </Flex>
            </a>

            {/* Hamburger Menu Button for small screens */}
            <Button
                className="sm:hidden"
                type="text"
                icon={<MenuOutlined />}
                onClick={showDrawer}
                style={{ color: 'white', fontSize: '20px' }}
            />

            <ConfigProvider theme={headerStyle}>
                {/* Drawer for small screens */}
                <Drawer
                    title="Menu"
                    placement="right"
                    closable
                    onClose={closeDrawer}
                    visible={visible}
                    bodyStyle={{ padding: 0 }}
                    className='fixed top-0 right-0 h-screen !bg-blue-600 '
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        className="bg-blue-600 !text-sm sm:text-base border-t-2 border-white"
                    >
                        {items.map((item, index) => (
                            <Menu.Item key={index + 1}>
                                <Link to={item.href}>{item.label}</Link>
                            </Menu.Item>
                        ))}
                    </Menu>
                </Drawer>

                {/* Menu for larger screens */}
                <Menu
                    mode="horizontal"
                    selectedKeys={[selectedKey]}
                    className="bg-blue-600 !text-sm sm:text-base hidden sm:block"
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
