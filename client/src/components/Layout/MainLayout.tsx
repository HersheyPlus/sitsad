import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "../Shared/Header";

const { Content, Footer } = Layout;

const MainLayout = () => (
    <Layout className="min-h-screen bg-gray">
        <Header />
        <Content>
            <Outlet />
        </Content>
        <Footer className="py-4 text-center text-white bg-blue-900">
            SIT Krana ©{new Date().getFullYear()} Created by SIT
        </Footer>
    </Layout>
);

export default MainLayout;