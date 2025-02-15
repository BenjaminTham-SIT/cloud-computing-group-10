import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../AuthContext';

const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev';

function ForumPage() {
  const { token } = useContext(AuthContext);
  const { forumId } = useParams();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/getPosts?topic_id=${forumId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        let postsData = [];
        if (data.body) {
          try {
            const parsedBody = JSON.parse(data.body);
            if (parsedBody.data && Array.isArray(parsedBody.data)) {
              postsData = parsedBody.data;
            } else {
              console.error("Parsed body does not contain an array in 'data'", parsedBody);
            }
          } catch (err) {
            console.error("Error parsing body as JSON", err);
          }
        }
        setPosts(postsData);
      })
      .catch(err => console.error('Error fetching posts:', err));
  }, [forumId, token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      title: newPost,
      topic_id: forumId,
    };

    fetch(`${API_BASE_URL}/createPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        let newPostData;
        if (data.body) {
          try {
            const parsedBody = JSON.parse(data.body);
            newPostData = parsedBody.data ? parsedBody.data : parsedBody;
          } catch (err) {
            console.error("Error parsing new post response:", err);
            newPostData = data;
          }
        } else {
          newPostData = data;
        }
        setPosts([...posts, newPostData]);
        setNewPost('');
      })
      .catch(err => console.error('Error adding post topic:', err));
  };

  return (
    <div>
      <NavBar />
      <h1>Posts</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Enter new post title"
          required
        />
        <button type="submit">Add Post</button>
      </form>
      <ul>
        {posts.map(post => (
          <li key={post.id || post.post_id}>
            <Link to={`/post/${post.id || post.post_id}`}>{post.title || post.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="/">Back to Forums</Link>
    </div>
  );
}

export default ForumPage;
