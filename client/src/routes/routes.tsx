import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";

// import DashboardHome from "../pages/Dashboard/DashboardHome";
// import DashboardSettings from "../pages/Dashboard/DashboardSettings";
// import DashboardAnalytics from "../pages/Dashboard/DashboardAnalytics";
// import SlugPage from "@/components/Pages/SlugPage";

import NotFoundPage from "@/pages/NotFoundPage";

import MainLayout from "@/components/Layout/MainLayout";
import AdminLayout from "@/components/Layout/AdminLayout";
import ProtectedRoute from "@/components/Pages/Auth/ProtectedRoute";
import TablePage from "@/pages/table/TablePage";
import TableSlugPage from "@/pages/table/TableSlugPage";


export const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { path: "", element: <HomePage /> },
        ],
    },
    {
        path: "/table",
        element: <MainLayout />,
        children: [
            { path: "", element: <TablePage /> },
            { path: ":slug", element: <TableSlugPage /> },
        ]
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <AdminLayout />
            </ProtectedRoute>
        ),
        // children: [
        //     { path: "", element: <DashboardHome /> },
        //     { path: "settings", element: <DashboardSettings /> },
        //     { path: "analytics", element: <DashboardAnalytics /> },
        // ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];
