// routes/SellerRoutes.ts
import SellerLayout from "../layout/SellerLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import ProductManagement from "../pages/seller/product/ProductManagerment";
import ProductsCreate from "../pages/seller/product/ProductCreate";
import { Navigate } from "react-router-dom";
import { ROLE } from "../constants";
import ProductEdit from "../pages/seller/product/ProductEdit";
import PromotionManagement from "../pages/seller/promotions/PromotionManagement";
import PromotionCreate from "../pages/seller/promotions/PromotionCreate";
import PromotionEdit from "../pages/seller/promotions/PromotionEdit";
import ProfileForm from "../pages/admin/Profile";
import CategoryManagement from "../pages/seller/category/CategoryManagement";
import CategoryCreate from "../pages/seller/category/CategoryCreate";
import CategoryEdit from "../pages/seller/category/CategoryEdit";
import ProductVariantManagerment from "../pages/seller/product/ProductVariantManagerment";

const SellerRoutes = [
  {
    path: "/seller",
    element: (
      <ProtectedRoute allowedRoles={[ROLE.SELLER]}>
        <SellerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: <DashboardAdmin />,
      },
      {
        path: "products",
        element: <ProductManagement />,
      },
      {
        path: "products/create",
        element: <ProductsCreate />,
      },
      {
        path: "products/edit/:id",
        element: <ProductEdit />,
      },
      // {
      //   path: "productVariants",
      //   element: <ProductVariantManagerment />,
      // },
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
      {
        path: "category",
        element: <CategoryManagement />,
      },
      {
        path: "category/create",
        element: <CategoryCreate />,
      },
      {
        path: "category/edit/:id",
        element: <CategoryEdit />,
      },

      {
        path: "profile",
        element: <ProfileForm />,
      },
    ],
  },
];

export default SellerRoutes;
