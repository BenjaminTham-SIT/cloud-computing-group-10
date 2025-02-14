import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from './components/NavBar';


const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getTopics';

function ForumPage() {
  const { forumId } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/getPosts?topic_id=${forumId}`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  }, [forumId]);

  return (
    <div>
              <NavBar />

      <h1>Forum: {forumId}</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/post/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <Link to="/">Back to Forums</Link>
    </div>
  );
}

export default ForumPage;
