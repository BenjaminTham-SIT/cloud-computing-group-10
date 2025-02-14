// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import HomePage from './pages/HomePage';
import ForumPage from './pages/ForumPage';
import PostPage from './pages/PostPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const auth = useAuth();

  // Configure sign-out redirect (replace placeholders with your actual values)
  const signOutRedirect = () => {
    const clientId = "3c2ncrmuc1qiakldgkldndfg5n";
    const logoutUri = "https://yourdomain.com/logout"; // Replace with your logout URI
    const cognitoDomain = "https://us-east-1dad3lruxx.auth.us-east-1.amazoncognito.com/"; // Replace with your user pool domain
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

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
            <span>Hello, {auth.user?.profile.email}</span>
            {' '}
            <button onClick={() => auth.removeUser()}>Local Sign out</button>
            {' '}
            <button onClick={signOutRedirect}>Global Sign out</button>
          </div>
        ) : (
          <div>
            <button onClick={() => auth.signinRedirect()}>Sign in</button>
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
