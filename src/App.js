import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ForumPage from './pages/ForumPage';
import PostPage from './pages/PostPage';
// import { withAuthenticator } from 'aws-amplify-react'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/forum/:forumId" element={<ForumPage />} />
        <Route path="/post/:postId" element={<PostPage />} />
      </Routes>
    </Router>
  );
}

export default App;
