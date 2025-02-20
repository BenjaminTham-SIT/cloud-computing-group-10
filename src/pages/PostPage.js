import React, { useState, useEffect } from "react";
import { format } from "date-fns"
import { useParams, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress
} from "@mui/material";

const PostPage = () => {
  const { postId } = useParams();
  const location = useLocation();
  const postTitle = location.state?.postTitle || "Unknown Title";
  const postContent = location.state?.postContent || "No content available";

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // On mount, fetch comments for this post
  useEffect(() => {
    setIsLoading(true);

    const token = sessionStorage.getItem("idToken");
    // If no token, you can decide to skip fetch or show a "please login" message
    if (!token) {
      console.error("No token in sessionStorage; user is not logged in?");
      setIsLoading(false);
      return;
    }

    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;
    setLoggedInUserId(userID);

    fetch(
      `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((response) => response.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        let allComments = [];
        if (Array.isArray(parsedData.comments)) {
          allComments = parsedData.comments;
        } else if (Array.isArray(parsedData.data)) {
          allComments = parsedData.data;
        }
        // Filter comments that match this post
        const filtered = allComments.filter(
          (comment) => comment.post_id === parseInt(postId, 10)
        );
        setComments(filtered);
      })
      .catch((error) => console.error("Error fetching comments:", error))
      .finally(() => setIsLoading(false));
  }, [postId]);

  // Editing a comment
  const handleCommentEdit = (commentId, currentContent) => {
    const updatedContent = prompt("Edit your comment:", currentContent);
    if (!updatedContent) return;

    const token = sessionStorage.getItem("idToken");
    if (!token) {
      console.error("No token found; user not logged in");
      return;
    }

    // You may decode to find user_id if your Lambda requires it
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;

    const payload = {
      user_id: userID,
      comment_id: commentId,
      content: updatedContent
    };
    console.log(payload);

    fetch(
      "https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/updateComment",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        // re-fetch comments after posting
        return fetch(
          `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((res) => res.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        let allComments = [];
        if (Array.isArray(parsedData.comments)) {
          allComments = parsedData.comments;
        } else if (Array.isArray(parsedData.data)) {
          allComments = parsedData.data;
        }
        const filtered = allComments.filter(
          (comment) => comment.post_id === parseInt(postId, 10)
        );
        setComments(filtered);
        setNewComment("");
      })
      .catch((error) => console.error("Error updating comment:", error));
    
    
    
  };

  // Deleting a comment
  const handleCommentDelete = (commentId) => {
    const token = sessionStorage.getItem("idToken");
    if (!token) {
      console.error("No token found; user not logged in");
      return;
    }

    // Optionally decode the token to get user_id if your Lambda needs it
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;

    const payload = {
      user_id: userID,
      comment_id: commentId
    };

    fetch(
      "https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/deleteComment",
      {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
         },
        body: JSON.stringify(payload)
      }
    )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      // re-fetch comments after deleting
      return fetch(
        `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    })
    .then((res) => res.json())
    .then((data) => {
      const parsedData = data.body ? JSON.parse(data.body) : data;
      let allComments = [];
      if (Array.isArray(parsedData.comments)) {
        allComments = parsedData.comments;
      } else if (Array.isArray(parsedData.data)) {
        allComments = parsedData.data;
      }
      const filtered = allComments.filter(
        (comment) => comment.post_id === parseInt(postId, 10)
      );
      setComments(filtered);
      setNewComment("");
    })
      .catch((error) => console.error("Error deleting comment:", error));
  };


  // Submitting a new comment
  const handleNewCommentSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("idToken");
    if (!token) {
      console.error("No token found; user is not logged in");
      return;
    }

    // Decode to get userID
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;

    const payload = {
      user_id: userID,
      post_id: postId,
      content: newComment
    };

    fetch(
      "https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    )
      .then((response) => response.json())
      .then(() => {
        // re-fetch comments after posting
        return fetch(
          `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((res) => res.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        let allComments = [];
        if (Array.isArray(parsedData.comments)) {
          allComments = parsedData.comments;
        } else if (Array.isArray(parsedData.data)) {
          allComments = parsedData.data;
        }
        const filtered = allComments.filter(
          (comment) => comment.post_id === parseInt(postId, 10)
        );
        setComments(filtered);
        setNewComment("");
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            {postTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {postContent}
          </Typography>

          <Typography variant="h5" gutterBottom>
            Comments
          </Typography>
          <List sx={{ mb: 3 }}>
            {comments.map((comment) => {
              // Format the timestamp to a readable format (12-hour with AM/PM)
              const formattedDate = comment.created_at
                ? format(new Date(comment.created_at), "dd MMM yyyy, h:mm a") // 12-hour format
                : "Unknown Date";

              return (
                <Paper key={comment.id} sx={{ mb: 2, p: 2 }}>
                  {/* Display Username and Formatted Timestamp */}
                  <Typography variant="subtitle2" color="text.secondary">
                    {comment.username} • {formattedDate}
                  </Typography>

                  {/* Comment Content */}
                  <ListItem disablePadding>
                    <ListItemText primary={comment.content} />
                  </ListItem>

                  {/* Show Edit and Delete buttons only if the comment belongs to the logged-in user */}
                  {comment.user_id === loggedInUserId && (
                    <Box sx={{ mt: 1 }}>
                      {/* Edit Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCommentEdit(comment.comment_id, comment.content)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      {/* Delete Button */}
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCommentDelete(comment.comment_id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Paper>

              );
            })}
          </List>

          <Typography variant="h6" gutterBottom>
            Add a Comment
          </Typography>
          <Box
            component="form"
            onSubmit={handleNewCommentSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >

            <TextField
              label="Your comment"
              multiline
              minRows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />

            <Button variant="contained" type="submit">
              Post Comment
            </Button>
          </Box>

        </>
      )}
    </Container>
  );
};

export default PostPage;
