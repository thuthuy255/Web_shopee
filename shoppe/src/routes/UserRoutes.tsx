import UserLayout from "../layout/UserLayout";
import HomePage from "../pages/user/HomePage";
import CartPage from "../pages/user/CartPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLE } from "../constants";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import ShopPage from "../pages/user/ShopPage";
import OrderDetail from "../pages/user/OrderDetailPage";
import ProductsPage from "../pages/user/ProductsPage";
import PaymentResultPage from "../pages/user/PaymentResultPage";
import MyPaidOrders from "../pages/user/MyPaidOrders";

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
        path: "products", // 👈 chỉ cần /user/products, query lấy bằng useSearchParams
        element: <ProductsPage />,
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
      {
        path: "payment-result",
        element: <PaymentResultPage />,
      },
      {
        path: "orderstatus",
        element: <MyPaidOrders />,
      }

    ],
  },
];

export default UserRoutes;
