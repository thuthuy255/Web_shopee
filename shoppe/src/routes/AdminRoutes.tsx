// src/routes/AdminRoutes.tsx
import AdminLayout from "../layout/AdminLayout";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import SellerManagement from "../pages/admin/seller/SellerManagement";
import ProductManagement from "../pages/admin/product/ProductManagement";
import ProfileForm from "../pages/admin/Profile";
import ProtectedRoute from "./ProtectedRoute";
import { ROLE } from "../constants";
import SellerEdit from "../pages/admin/seller/SellerEdit";
import SellerCreate from "../pages/admin/seller/SellerCreate";
import BannerManagement from "../pages/admin/banner/BannerManagement";
import BannerCreate from "../pages/admin/banner/BannerCreate";
import BannerEdit from "../pages/admin/banner/BannerEdit";
import CategoryManagement from "../pages/admin/category/CategoryManagement";
import PromotionManagement from "../pages/admin/promotions/PromotionManagement";
import PromotionCreate from "../pages/admin/promotions/PromotionCreate";
import PromotionEdit from "../pages/admin/promotions/PromotionEdit";
import UserManagement from "../pages/admin/user/UserManagement";

const AdminRoutes = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={[ROLE.ADMIN]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardAdmin />,
      },
      {
        path: "dashboard",
        element: <DashboardAdmin />,
      },
      {
        path: "seller",
        element: <SellerManagement />,
      },
      {
        path: "user",
        element: <UserManagement />,
      },
      {
        path: "seller/create",
        element: <SellerCreate />,
      },
      {
        path: "seller/edit/:id",
        element: <SellerEdit />,
      },
      {
        path: "products",
        element: <ProductManagement />,
      },
      {
        path: "profile",
        element: <ProfileForm />,
      },
      {
        path: "banner",
        element: <BannerManagement />,
      },
      {
        path: "banner/create",
        element: <BannerCreate />,
      },

      {
        path: "banner/edit/:id",
        element: <BannerEdit />,
      },
      {
        path: "category",
        element: <CategoryManagement />,
      },
      {
        path: "promotions",
        element: <PromotionManagement />,
      },
      {
        path: "promotions/create",
        element: <PromotionCreate />,
      },
      {
        path: "promotions/edit/:id",
        element: <PromotionEdit />,
      },
    ],
  },
];

export default AdminRoutes;
