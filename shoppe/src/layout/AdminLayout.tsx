// components/layouts/AdminLayout.tsx
import React from 'react';
import MainLayout from './MainLayout';

const AdminLayout = () => {
    return <MainLayout basePath="admin" defaultRole="admin" />;
};

export default AdminLayout;
