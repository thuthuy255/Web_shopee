// AuthRoutes.ts
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

export const AuthMainRoutes = [
  {
    path: "/auth",
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  // {
  //   path: "*",
  //   element: <Navigate to="/auth/login141241" replace />,
  // },
];
