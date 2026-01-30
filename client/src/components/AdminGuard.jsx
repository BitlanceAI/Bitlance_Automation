import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminGuard = ({ children }) => {
    const { user, loading } = useAuth();
    // Hardcoded admin email for now
    const ADMIN_EMAIL = 'rahul7697762@gmail.com';

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminGuard;
