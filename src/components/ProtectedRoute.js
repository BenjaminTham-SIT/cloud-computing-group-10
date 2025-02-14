// src/components/ProtectedRoute.js
import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();

  if (auth.isLoading) {
    // Optionally render a loading indicator while the auth state is determined
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    // If the user isn't authenticated, trigger sign-in (or redirect to a dedicated login page)
    auth.signinRedirect();
    return null;
    // Alternatively, you could use:
    // return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
