import UserLayout from "../layout/UserLayout";
import HomePage from "../pages/user/HomePage";
import CartPage from "../pages/user/CartPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLE } from "../constants";
import ProductDetailPage from "../pages/user/ProductDetailPage";

const UserRoutes = [
  {
    path: "/user",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "cart",
        element: (
          <ProtectedRoute allowedRoles={[ROLE.USER]}>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "products/:id", // Đường dẫn đầy đủ là /user/products/:id
        element: <ProductDetailPage />,
      },
    ],
  },
];

export default UserRoutes;
