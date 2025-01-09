import React from 'react';
import { Flex, Layout, Menu } from 'antd';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
    return (
        <AntHeader className="flex items-center justify-between bg-blue-600">
            <Flex align='center' gap={8}>
                <img src="/assets/logo.png" alt="SIT Krana" className="w-auto h-12" />
                <div className="text-2xl font-bold text-white">SIT Krana</div>
            </Flex>
            <Menu
                mode="horizontal"
                defaultSelectedKeys={['1']}
                className="text-white bg-blue-600"
            >
                <Menu.Item key="1">Home</Menu.Item>
                <Menu.Item key="2">About</Menu.Item>
                <Menu.Item key="3">Contact</Menu.Item>
            </Menu>
        </AntHeader >
    );
};

export default Header;

