// AuthRoutes.ts
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPasswordForm from "../pages/auth/ResetPassword";
import SendOTP from "../pages/auth/SendOTP";
import VerifyOTP from "../pages/auth/VerifyOTP";

export const AuthMainRoutes = [
  {
    path: "/auth",
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "sendOTP", element: <SendOTP /> },
      { path: "verifyOTP", element: <VerifyOTP /> },
      { path: "reset-password", element: <ResetPasswordForm /> },

    ],
  },
  // {
  //   path: "*",
  //   element: <Navigate to="/auth/login141241" replace />,
  // },
];
