// App.js
import React from "react";
import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TopicPage from "./pages/TopicPage";
import PostPage from "./pages/PostPage";

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "1qj4he9g2rfu8bl1i3kuhm74r6";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://us-east-1rlxwmq8po.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  return (
    <Router>
      <header>
        <nav>
          <Link to="/">Home</Link>
          {auth.isAuthenticated && (
            <span style={{ marginLeft: "10px" }}>
              Welcome, {auth.user?.profile.email}
            </span>
          )}
          {auth.isAuthenticated ? (
            <button onClick={() => auth.removeUser()} style={{ marginLeft: "10px" }}>
              Sign Out
            </button>
          ) : (
            <button onClick={() => auth.signinRedirect()} style={{ marginLeft: "10px" }}>
              Sign In
            </button>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/post/:postId" element={<PostPage />} />
      </Routes>
    </Router>
  );
}

export default App;
