// /pages/TopicPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";

const TopicPage = () => {
  const { topicId } = useParams();
  const auth = useAuth();
  const token = auth.user?.id_token;
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ name: "", content: "" });

  // Fetch posts for the given topic using the id token
  useEffect(() => {
    console.log("Current topicId:", topicId);
    fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?topicId=${topicId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // If your API response is wrapped, parse the body
        const parsedData = data.body ? JSON.parse(data.body) : data;
        if (!Array.isArray(parsedData.data)) {
          console.error("Expected an array but got:", parsedData.data);
          return;
        }
        setPosts(parsedData.data);
      })
      .catch((error) => console.error("Error fetching posts:", error));
  }, [topicId, token]);

  const handleInputChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const postData = {
      userID: "currentUserId", // Replace with the actual authenticated user id if available
      topicID: topicId,
      ...newPost,
    };

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(postData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // If the response data is wrapped, parse it similarly.
        const parsedData = data.body ? JSON.parse(data.body) : data;
        setPosts([...posts, parsedData]);
        setNewPost({ name: "", content: "" });
      })
      .catch((error) => console.error("Error creating post:", error));
  };

  return (
    <div>
      <h1>Posts for Topic {topicId}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/post/${post.id}`}>{post.name}</Link>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>

      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Post Title"
          value={newPost.name}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="content"
          placeholder="Content"
          value={newPost.content}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default TopicPage;
