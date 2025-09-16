import UserLayout from "../layout/UserLayout";
import HomePage from "../pages/user/HomePage";
import CartPage from "../pages/user/CartPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLE } from "../constants";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import ShopPage from "../pages/user/ShopPage";
import OrderList from "../pages/user/OrderList";
import OrderDetail from "../pages/user/OrderDetailPage";

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
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "shop/:sellerId",
        element: <ShopPage />,
      },
      {
        path: "checkout",
        element: <OrderDetail />,
      },
      {
        path: "order/:orderId",
        element: <OrderDetail />,
      },
    ],
  },
];

export default UserRoutes;
