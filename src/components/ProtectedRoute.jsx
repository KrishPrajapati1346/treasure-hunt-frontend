import { Navigate } from 'react-router-dom';
import React, { useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    console.log('Protected Route Check:', { 
      token: token ? 'Exists' : 'Missing', 
      userRole, 
      allowedRoles,
      authorized: allowedRoles.includes(userRole)
    });
  }, [token, userRole, allowedRoles]);

  if (!token) {
    console.log('No authentication token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.log(`User role (${userRole}) not authorized for this route. Allowed roles:`, allowedRoles);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;