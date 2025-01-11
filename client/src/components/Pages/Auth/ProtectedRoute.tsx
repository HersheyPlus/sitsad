import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface IProps {
    children: React.ReactNode;
}
const ProtectedRoute = ({ children }: IProps) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
