// /pages/TopicPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const TopicPage = () => {
  const { topicId } = useParams();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ name: "", content: "" });

  // Fetch posts for the given topic. Adjust query parameters as needed.
  useEffect(() => {
    fetch(`https://mdycmjdjc2.execute-api.us-east-1.amazonaws.com/dev/getPosts?topicId=${topicId}`)
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, [topicId]);

  const handleInputChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace "currentUserId" with the actual authenticated user ID as needed.
    const postData = {
      userID: "currentUserId",
      topicID: topicId,
      ...newPost,
    };

    fetch("https://mdycmjdjc2.execute-api.us-east-1.amazonaws.com/dev/newPost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts([...posts, data]);
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
            {/* Assumes each post has an 'id', 'name', and 'content' */}
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
