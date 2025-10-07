// routes/SellerRoutes.ts
import SellerLayout from "../layout/SellerLayout";
import ProtectedRoute from "./ProtectedRoute";
import ProductManagement from "../pages/seller/product/ProductManagerment";
import ProductsCreate from "../pages/seller/product/ProductCreate";
import { Navigate } from "react-router-dom";
import { ROLE } from "../constants";
import ProductEdit from "../pages/seller/product/ProductEdit";
import ProfileForm from "../pages/admin/Profile";
import CategoryManagement from "../pages/seller/category/CategoryManagement";
import CategoryCreate from "../pages/seller/category/CategoryCreate";
import CategoryEdit from "../pages/seller/category/CategoryEdit";
import OrderManagerment from "../pages/seller/orders/OrderManagerment";
import DashboardSeller from "../pages/seller/DashboardSeller";
import OrderStatistics from "../pages/seller/analystic/OrderStatistics";

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
        element: <DashboardSeller />,
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
      {
        path: "orders",
        element: <OrderManagerment />
      },
      {
        path: "analystic",
        element: <OrderStatistics />
      }
    ],
  },
];

export default SellerRoutes;
