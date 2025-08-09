// routes/RouteMap.tsx
import SellerRoutes from "./SellerRoutes";
import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes";
import { ROLE } from "../constants";

const RouteMap: Record<string, any[]> = {
  [ROLE.ADMIN]: [...AdminRoutes],
  [ROLE.SELLER]: [...SellerRoutes],
  // ,[ROLE.USER]: [...UserRoutes],
};

export default RouteMap;
