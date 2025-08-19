// components/ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { getStateApp } from "../features/slices/app.slice";
import LoadingDefault from "../components/loading/LoadingDefault";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const location = useLocation();
  const stateApp = useSelector(getStateApp);
  const token = localStorage.getItem("access_token");
  if (token && !stateApp.role_id) {
    return <LoadingDefault />
  }

  if (!token || !stateApp.role_id) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(stateApp.role_id)) {
    return <Navigate to="/unauthorized" replace />; // hoặc về trang 404
  }

  return children;
};

export default ProtectedRoute;
