// components/layouts/MainLayout.tsx
import React, { useState } from 'react';
import {
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Tooltip, Image, Button, theme, Input } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { MenuProps } from 'antd';

import type { RootState } from '../features/store';
import { getMenuByRole } from './MenuIttem';
import { getTokenState, resetLogin } from '../features/slices/app.slice';
import logo from '../assets/img/logo.png';
import person from '../assets/img/person.png';
import { ROLE } from '../constants';

const { Header, Sider, Content } = Layout;
const { Search } = Input;

interface MainLayoutProps {
    basePath: 'Admin' | 'Seller' | 'User';
    defaultRole?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ basePath, defaultRole = ROLE.USER }) => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const roleId = useSelector(getTokenState);
    const role = roleId;
    const menuItems = getMenuByRole(role);

    const handleLogout = () => {
        dispatch(resetLogin());
        navigate('/auth/login');
    };

    const handleProfile = () => {
        navigate(`/${basePath}/profile`);
    };

    const dropdownItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: 'Trang cá nhân',
            icon: <UserOutlined />,
            onClick: handleProfile,
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 96,
                        padding: '12px 0',
                    }}
                >
                    <Image
                        src={logo}
                        alt="logo"
                        preview={false}
                        style={{ width: collapsed ? 32 : 64, transition: 'all 0.3s ease' }}
                    />
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname.split('/')[2]]}
                    onClick={({ key }) => navigate(`/${basePath}/${key}`)}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0 16px',
                        }}
                    >
                        <div style={{ display: 'flex', width: '40%', alignItems: 'center' }}>
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />
                            <Search style={{ width: '60%' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                            <Tooltip title="Thông báo">
                                <BellOutlined style={{ fontSize: '20px' }} />
                            </Tooltip>
                            {role === 'Admin' && (
                                <Tooltip title="Cài đặt">
                                    <SettingOutlined style={{ fontSize: '20px' }} />
                                </Tooltip>
                            )}
                            <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
                                <Image
                                    src={person}
                                    alt="avatar"
                                    preview={false}
                                    style={{
                                        width: 45,
                                        height: 45,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                    }}
                                />
                            </Dropdown>
                        </div>
                    </div>
                </Header>
                <Content
                    style={{
                        padding: 16,
                        height: 'calc(100vh - 64px)',
                        overflowY: 'auto',
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
