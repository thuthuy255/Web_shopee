import { Navigate } from "react-router-dom";
import { getRoleIdState } from "../features/slices/app.slice";
import { useSelector } from "react-redux";
interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles: string[]; // hoặc cụ thể như ('admin' | 'seller' | 'user')[]
}
export default function ProtectedRoute({
  element,
  allowedRoles,
}: ProtectedRouteProps) {
  const roleFromStore = useSelector(getRoleIdState);
  if (!roleFromStore) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(roleFromStore))
    return <Navigate to="/unauthorized" replace />;

  return element;
}
