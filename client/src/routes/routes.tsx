import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";

// import DashboardHome from "../pages/Dashboard/DashboardHome";
// import DashboardSettings from "../pages/Dashboard/DashboardSettings";
// import DashboardAnalytics from "../pages/Dashboard/DashboardAnalytics";
// import SlugPage from "@/components/Pages/SlugPage";

import NotFoundPage from "@/pages/NotFoundPage";

import MainLayout from "@/components/Layout/MainLayout";
import AdminLayout from "@/components/Layout/AdminLayout";

// import ProtectedRoute from "@/components/Pages/Auth/ProtectedRoute";

// import AdminTablePage from "@/pages/table/AdminTablePage";
import TableSlugPage from "@/pages/table/TableSlugPage";
// import LocationPage from "@/pages/LocationPage";
import DashboardPage from "@/pages/DashboardPage";
import ToiletSlugPage from "@/pages/toilet/ToiletSlugPage";
import ToiletPage from "@/pages/toilet/ToiletPage";
import TablePage from "@/pages/table/TablePage";
import AdminToiletPage from "@/pages/toilet/AdminToiletPage";
import LocationPage from "@/pages/LocationPage";
import AdminTablePage from "@/pages/table/AdminTablePage";
import ForgotItemPage from "@/pages/forgot-item/ForgotItemPage";
import DevicePage from "@/pages/DevicePage";
import ReservationPage from "@/pages/ReservationPage";
// import AdminToiletPage from "@/pages/toilet/AdminToiletPage";

export const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { path: "", element: <HomePage /> },
        ],
    },
    {
        path: "/forgot-item",
        element: <MainLayout />,
        children: [
            { path: "", element: <ForgotItemPage /> },
        ]
    },
    {
        path: "/table",
        element: <MainLayout />,
        children: [
            { path: "", element: <TablePage /> },
            { path: "room/:slug", element: <TableSlugPage /> },
        ]
    },
    {
        path: "/toilet",
        element: <MainLayout />,
        children: [
            { path: "", element: <ToiletPage /> },
            { path: "room/:slug", element: <ToiletSlugPage /> },
        ]
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/dashboard",
        element: (
            // <ProtectedRoute>
            //     <AdminLayout />
            // </ProtectedRoute>
            <AdminLayout />
        ),
        children: [
            { path: "", element: <DashboardPage /> },
            { path: "table", element: <AdminTablePage /> },
            { path: "toilet", element: <AdminToiletPage /> },
            { path: "location", element: <LocationPage /> },
            { path: "forgot-item", element: <ForgotItemPage /> },
            { path: "device", element: <DevicePage /> },
            {
                path: "*", element: <NotFoundPage />
            }
        ],
    },
    {
        path: "/reserve",
        children: [
            { path: "", element: <NotFoundPage /> },
            { path: ":tableId", element: <ReservationPage /> },
        ]
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];
