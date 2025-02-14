import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';


const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev';

function ForumPage() {
  const { forumId } = useParams();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  // useEffect(() => {
  //   fetch(`${API_BASE_URL}/getPosts?topic_id=${forumId}`)
  //     .then(res => res.json())
  //     .then(data => setPosts(data))
  //     .catch(err => console.error('Error fetching posts:', err));
  // }, [forumId]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/getPosts?topic_id=${forumId}`)
      .then(res => res.json())
      .then(data => {
        // Check if the data comes in a 'body' property as a JSON string
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
        } else if (Array.isArray(data)) {
          postsData = data;
        } else {
          console.error("Unexpected data format", data);
        }
        setPosts(postsData);
      })
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

  //   fetch(`${API_BASE_URL}/createPost`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(payload)
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       // Option 1: If your API returns the newly created topic, add it to the existing list
  //       setPosts([...posts, data]);
  //       // Option 2: Alternatively, refetch the topics if the API doesn't return the new topic directly
  //       setNewPost('');
  //     })
  //     .catch(err => console.error('Error adding post topic:', err));
  // };
  fetch(`${API_BASE_URL}/createPost`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      let newPostData;
      if (data.body) {
        try {
          const parsedBody = JSON.parse(data.body);
          // Assume the API returns the new post within 'data'
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
