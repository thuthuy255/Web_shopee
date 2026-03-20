// routes/RouteMap.tsx
import SellerRoutes from "./SellerRoutes";
import AdminRoutes from "./AdminRoutes";
import { ROLE } from "../constants";

const RouteMap: Record<string, any[]> = {
  [ROLE.ADMIN]: [...AdminRoutes],
  [ROLE.SELLER]: [...SellerRoutes],
};

export default RouteMap;
