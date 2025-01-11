import { Outlet } from "react-router-dom";
import Header from "../Shared/Header";

const AdminLayout = () => (
    <div>
        <Header />
        <main>
            <Outlet />
        </main>
    </div>
);

export default AdminLayout;