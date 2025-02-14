import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = 'https://your-api-gateway-endpoint'; // update this

function ForumPage() {
  const { forumId } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/forums/${forumId}/posts`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  }, [forumId]);

  return (
    <div>
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
