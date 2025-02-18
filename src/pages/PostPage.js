

import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";

// --- IMPORT MUI COMPONENTS ---
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
  const auth = useAuth();
  const { postId } = useParams();
  const location = useLocation();
  const postTitle = location.state?.postTitle || "Unknown Title";
  const postContent = location.state?.postContent || "No content available";

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const token = auth.user?.id_token;

  const [isLoading, setIsLoading] = useState(false);


  // 1) Fetch comments on mount
  useEffect(() => {
    setIsLoading(true);

    fetch(
      `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
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
        const filtered = allComments.filter(
          (comment) => comment.post_id === parseInt(postId, 10)
        );
        setComments(filtered);
      })
      .catch((error) => console.error("Error fetching comments:", error))
      .finally(() => setIsLoading(false));
  }, [postId, token]);

  // 2) Edit a comment
  const handleCommentEdit = (commentId, currentContent) => {
    const updatedContent = prompt("Edit your comment:", currentContent);
    if (updatedContent) {
      const payload = {
        user_id: "currentUserId", // Replace with actual user id
        comment_id: commentId,
        content: updatedContent
      };

      fetch(
        "https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/updateComment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify(payload)
        }
      )
        .then((response) => response.json())
        .then((updatedComment) => {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? updatedComment : comment
            )
          );
        })
        .catch((error) => console.error("Error updating comment:", error));
    }
  };

  // 3) Delete a comment
  const handleCommentDelete = (commentId) => {
    const payload = {
      user_id: "currentUserId",
      comment_id: commentId
    };

    fetch(
      "https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/deleteComment",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    )
      .then((response) => {
        if (response.ok) {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
      })
      .catch((error) => console.error("Error deleting comment:", error));
  };

  // 4) File / S3 Logic
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileContent = reader.result.split(",")[1];
      setFilePreview(reader.result);

      const formData = new FormData();
      formData.append("content", fileContent);
      formData.append("file_name", file.name);

      fetch(
        "https://pwsgthrir2.execute-api.us-east-1.amazonaws.com/test-stage/upload-data-s3",
        { method: "POST", body: formData }
      )
        .then((response) => response.json())
        .then((data) => console.log("Success:", data))
        .catch((error) => console.error("Error:", error));
    };
    reader.readAsDataURL(file);
  };

  const fetchImageFromS3 = async () => {
    try {
      const response = await fetch(
        "https://pwsgthrir2.execute-api.us-east-1.amazonaws.com/test-stage/retrieve-data-s3"
      );
      if (response.ok) {
        const data = await response.json();
        const responseBody = JSON.parse(data.body);
        const base64Image = responseBody.file_content;
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        setImageURL(imageUrl);
      } else {
        alert("Failed to fetch image from S3");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  // 5) Add a new comment
  const handleNewCommentSubmit = (e) => {
    e.preventDefault();
    if (!token) return;

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
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      }
    )
      .then((response) => response.json())
      .then(() => {
        // Re-fetch all comments
        return fetch(
          `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
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
        {comments.map((comment) => (
          <Paper key={comment.id} sx={{ mb: 2, p: 2 }}>
            <ListItem disablePadding>
              <ListItemText primary={comment.content} />
            </ListItem>
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleCommentEdit(comment.id, comment.content)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleCommentDelete(comment.id)}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        ))}
      </List>

      <Typography variant="h6" gutterBottom>
        Add a Comment
      </Typography>
      <Box component="form" onSubmit={handleNewCommentSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filePreview && (
          <>
            {selectedFile?.type.startsWith("image/") ? (
              <Box component="img" src={filePreview} alt="Selected Preview" width="300px" />
            ) : selectedFile?.type.startsWith("video/") ? (
              <video width="300" controls>
                <source src={filePreview} type={selectedFile.type} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Typography color="text.secondary">Unsupported file type</Typography>
            )}
          </>
        )}

        <Button variant="contained" component="label" sx={{ width: "fit-content" }}>
          Upload Image/Video
          <input
            type="file"
            accept="image/*, video/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>

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

      <Box sx={{ mt: 3 }}>
        {imageURL ? (
          <img src={imageURL} alt="Fetched from S3" style={{ width: "300px" }} />
        ) : (
          <Button variant="outlined" onClick={fetchImageFromS3}>
            Fetch Image from S3
          </Button>
        )}
      </Box>
      </>
      )}
    </Container>
  );
};

export default PostPage;
