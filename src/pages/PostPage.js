// /pages/PostPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";


const PostPage = () => {
  const auth = useAuth();
  const { postId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const token = auth.user?.id_token;

  // Fetch comments for this post (using post_id as a query parameter)
  // useEffect(() => {
  //   fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?post_id=${postId}`)
  //     .then((response) => response.json())
  //     .then((data) => setComments(data))
  //     .catch((error) => console.error("Error fetching comments:", error));
  // }, [postId]);

  // useEffect(() => {
  //   fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?post_id=${postId}`, {
  //     headers: token ? { Authorization: `Bearer ${token}` } : {}
  //   })
  //     .then((response) => response.json())
  //     .then((data) => setComments(data))
  //     .catch((error) => console.error("Error fetching comments:", error));
  // }, [postId, token]);
  useEffect(() => {
    fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?post_id=${postId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((response) => response.json())
      .then((data) => {
        // If the API response wraps your data in a "body" property, parse it first.
        const parsedData = data.body ? JSON.parse(data.body) : data;
        if (!Array.isArray(parsedData.data)) {
          console.error("Expected an array for comments, got:", parsedData.data);
          return;
        }
        setComments(parsedData.data);
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }, [postId, token]);
  

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleNewCommentSubmit = (e) => {
    e.preventDefault();
    const commentData = {
      user_id: "currentUserId", // Replace with actual authenticated user id
      post_id: postId,
      content: newComment,
    };

    // fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(commentData),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setComments([...comments, data]);
    //     setNewComment("");
    //   })
    //   .catch((error) => console.error("Error creating comment:", error));

    // fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     ...(token && { Authorization: `Bearer ${token}` })
    //   },
    //   body: JSON.stringify(commentData),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setComments([...comments, data]);
    //     setNewComment("");
    //   })
    //   .catch((error) => console.error("Error creating comment:", error));

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(commentData),
    })
      .then((response) => response.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        // Assuming parsedData contains the new comment (or adjust accordingly)
        setComments([...comments, parsedData]);
        setNewComment("");
      })
      .catch((error) => console.error("Error creating comment:", error));
    

  };

  const handleCommentEdit = (commentId, currentContent) => {
    const updatedContent = prompt("Edit your comment:", currentContent);
    if (updatedContent) {
      const payload = {
        user_id: "currentUserId", // Replace with actual user id
        comment_id: commentId,
        content: updatedContent,
      };

      fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/updateComment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((updatedComment) => {
          setComments(
            comments.map((comment) =>
              comment.id === commentId ? updatedComment : comment
            )
          );
        })
        .catch((error) => console.error("Error updating comment:", error));
    }
  };

  const handleCommentDelete = (commentId) => {
    const payload = {
      user_id: "currentUserId", // Replace with actual user id
      comment_id: commentId,
    };

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/deleteComment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          setComments(comments.filter((c) => c.id !== commentId));
        }
      })
      .catch((error) => console.error("Error deleting comment:", error));
  };

  return (
    <div>
      <h1>Post: {postId}</h1>
      <h2>Comments</h2>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <p>{comment.content}</p>
            <button onClick={() => handleCommentEdit(comment.id, comment.content)}>
              Edit
            </button>
            <button onClick={() => handleCommentDelete(comment.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>Add a Comment</h2>
      <form onSubmit={handleNewCommentSubmit}>
        <textarea
          value={newComment}
          onChange={handleNewCommentChange}
          placeholder="Your comment"
          required
        />
        <button type="submit">Post Comment</button>
      </form>
    </div>
  );
};

export default PostPage;
