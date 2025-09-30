// components/layouts/MainLayout.tsx
import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Image, Button, theme, Flex } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { MenuProps } from "antd";
import { getMenuByRole } from "./MenuIttem";
import { getRoleIdState, resetLogin } from "../features/slices/app.slice";
import logo from "../assets/img/logo_home.png";
import person from "../assets/img/person.png";
import { InfoUserState, resetUserState } from "../features/slices/user.slice";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  basePath: "Admin" | "Seller" | "User";
  defaultRole?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ basePath }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const user = useSelector(InfoUserState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const roleId = useSelector(getRoleIdState);
  const menuItems = getMenuByRole(roleId);
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    dispatch(resetUserState());
    dispatch(resetLogin());
    navigate("/auth/login");
  };

  const handleProfile = () => {
    navigate(`/${basePath}/profile`);
  };

  const dropdownItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Trang cá nhân",
      icon: <UserOutlined />,
      onClick: handleProfile,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 96,
            padding: "12px 0",
          }}
        >
          <Image
            src={logo}
            alt="logo"
            preview={false}
            style={{ width: collapsed ? 32 : 64, transition: "all 0.3s ease" }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.split("/")[2]]}
          onClick={({ key }) => navigate(`/${basePath}/${key}`)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 16px",
            }}
          >
            <div
              style={{ display: "flex", width: "40%", alignItems: "center" }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
              {/* <Search style={{ width: '60%' }} /> */}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              {user && (
                <Flex gap={20}>
                  <span>Xin chào, {user?.fullName || "User"}</span>
                  <Dropdown
                    menu={{ items: dropdownItems }}
                    placement="bottomRight"
                    arrow
                  >
                    <Image
                      src={user.avatar || person}
                      alt="avatar"
                      preview={false}
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                    />
                  </Dropdown>
                </Flex>
              )}
            </div>
          </div>
        </Header>
        <Content
          style={{
            padding: 16,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
