import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';


const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getTopics';

function ForumPage() {
  const { forumId } = useParams();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/getPosts?topic_id=${forumId}`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  }, [forumId]);

  // Handle the form submission for adding a new post topic
  const handleSubmit = (event) => {
    event.preventDefault();

    // Construct the payload for your POST request
    const payload = {
      title: newPost,
      topic_id: forumId
      // Include additional fields if needed by your API
    };

    fetch(`${API_BASE_URL}/createPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        // Option 1: If your API returns the newly created topic, add it to the existing list
        setPosts([...posts, data]);
        // Option 2: Alternatively, refetch the topics if the API doesn't return the new topic directly
        setNewPost('');
      })
      .catch(err => console.error('Error adding post topic:', err));
  };

  return (
    <div>
      <NavBar />
      <h1>Posts</h1>
      {/* Form to add a new post */}
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
      {/* List of posts */}
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
