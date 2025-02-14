
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = 'https://mdycmjdjc2.execute-api.us-east-1.amazonaws.com/dev';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Fetch post details
    fetch(`${API_BASE_URL}/posts/${postId}`)
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(err => console.error('Error fetching post:', err));
  }, [postId]);

  useEffect(() => {
    if (post) {
      // Fetch comments using the topic name (forumId) from the post
      fetch(`${API_BASE_URL}/${post.forumId}/comments/${postId}`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(err => console.error('Error fetching comments:', err));
    }
  }, [post, postId]);

  if (!post) {
    return <div>Loading post...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <h2>Comments</h2>
      {comments.length > 0 ? (
        <ul>
          {comments.map(comment => (
            <li key={comment.id}>
              <strong>{comment.author}</strong>: {comment.text}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
      <Link to={`/forum/${post.forumId}`}>Back to Forum</Link>
    </div>
  );
}

export default PostPage;
