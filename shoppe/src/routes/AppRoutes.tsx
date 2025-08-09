// AppRoutes.tsx
import { Navigate, useRoutes } from "react-router-dom";
import RouteMap from "./RouteMap";

import { getStateApp } from "../features/slices/app.slice";
import { useSelector } from "react-redux";
import { AuthMainRoutes } from "./AuthRoutes";
import UserRoutes from "./UserRoutes";
import { memo } from "react";

const AppRoutes = () => {
  const stateApp = useSelector(getStateApp);
  const DefaultRoute = [
    {
      path: "/",
      element: <Navigate to="/user" replace />,
    },
  ];
  const routes = stateApp?.role_id
    ? [
        ...DefaultRoute,
        ...UserRoutes,
        ...(RouteMap[stateApp?.role_id] || []),
        ...AuthMainRoutes,
      ]
    : [...DefaultRoute, ...AuthMainRoutes, ...UserRoutes];
  return useRoutes(routes);
};

export default memo(AppRoutes);
