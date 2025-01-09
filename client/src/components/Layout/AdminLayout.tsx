import { Outlet } from "react-router-dom";

const AdminLayout = () => (
    <div>
        <aside>Admin Sidebar</aside>
        <main>
            <Outlet />
        </main>
    </div>
);

export default AdminLayout;