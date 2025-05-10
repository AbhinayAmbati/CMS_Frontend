import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    // Redirect to dashboard if not an admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 