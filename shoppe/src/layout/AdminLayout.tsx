// components/layouts/AdminLayout.tsx
import React from 'react';
import MainLayout from './MainLayout';

const AdminLayout = () => {
    return <MainLayout basePath="Admin" defaultRole="Admin" />;
};

export default AdminLayout;
