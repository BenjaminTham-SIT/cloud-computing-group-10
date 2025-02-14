// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import HomePage from './pages/HomePage';
import ForumPage from './pages/ForumPage';
import PostPage from './pages/PostPage';
import ProtectedRoute from './components/ProtectedRoute';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_dAD3lRUXx",
  clientId: "3c2ncrmuc1qiakldgkldndfg5n", // changed from client_id to clientId
  redirectUri: "https://main.d1qhf3toawkd0w.amplifyapp.com/", // changed from redirect_uri
  responseType: "code", // changed from response_type
  scope: "phone openid email",
  postLogoutRedirectUri: "https://main.d1qhf3toawkd0w.amplifyapp.com/", // changed from post_logout_redirect_uri
};

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  return (
    <div>
      <header style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        {auth.isAuthenticated ? (
          <div>
            <span>Hello User, {auth.user?.profile.email}</span>
            {' '}
            <button onClick={() => auth.signoutRedirect({ extraQueryParams: { client_id: cognitoAuthConfig.clientId } })}>
  Sign Out
</button>

          </div>
        ) : (
          <div>
            <button onClick={() => auth.signinRedirect()}>Sign In</button>
          </div>
        )}
      </header>
      <Router>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }/>
          <Route path="/forum/:forumId" element={
            <ProtectedRoute>
              <ForumPage />
            </ProtectedRoute>
          }/>
          <Route path="/post/:postId" element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
