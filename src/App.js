// src/App.js
import React , {useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import HomePage from './pages/HomePage';
import ForumPage from './pages/ForumPage';
import PostPage from './pages/PostPage';
import ProtectedRoute from './components/ProtectedRoute';
// import { Auth } from 'aws-amplify';



const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_dAD3lRUXx",
  client_id: "3c2ncrmuc1qiakldgkldndfg5n",
  redirect_uri: "https://main.d1qhf3toawkd0w.amplifyapp.com/",
  response_type: "code",
  scope: "phone openid email",
  post_logout_redirect_uri: "https://main.d1qhf3toawkd0w.amplifyapp.com/", // add this line
};

// async function getIdToken() {
//   try {
//     const session = await Auth.currentSession();
//     const idToken = session.getIdToken().getJwtToken();  // ✅ Get the ID Token
//     console.log('ID Token:', idToken);
//     return idToken;
//   } catch (error) {
//     console.error('Error getting ID Token:', error);
//   }
// }

function App() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      // console.log("Access Token:", auth.user.access_token);
      // console.log("User:", auth.user);
      console.log("ID token:", auth.user.idToken);
    }
  }, [auth.isAuthenticated, auth.user]);

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
            <button onClick={() => auth.signoutRedirect()}>Sign Out 2</button>
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
