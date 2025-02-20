import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Fab
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const PostPage = () => {
  const { postId } = useParams();
  const location = useLocation();
  const postTitle = location.state?.postTitle || "Unknown Title";
  const postContent = location.state?.postContent || "No content available";

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateComment, setShowCreateComment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Fetch comments on mount
  useEffect(() => {
    setIsLoading(true);
    const token = sessionStorage.getItem("idToken");
    if (!token) {
      console.error("No token found; user is not logged in.");
      setIsLoading(false);
      return;
    }

    // Decode the token to extract the user ID
    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      setLoggedInUserId(tokenPayload.sub);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }

    fetch(
      `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((response) => response.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        let allComments = Array.isArray(parsedData.comments)
          ? parsedData.comments
          : Array.isArray(parsedData.data)
          ? parsedData.data
          : [];
        // Filter comments by this post
        const filtered = allComments.filter(
          (comment) => comment.post_id === parseInt(postId, 10)
        );
        setComments(filtered);
      })
      .catch((error) => console.error("Error fetching comments:", error))
      .finally(() => setIsLoading(false));
  }, [postId]);

  const handleInputChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("idToken");
    if (!token) {
      console.error("No token found; user is not logged in.");
      return;
    }

    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;

    const payload = {
      user_id: userID,
      post_id: postId,
      content: newComment
    };

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        // Re-fetch comments after posting
        return fetch(
          `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((res) => res.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        let allComments = Array.isArray(parsedData.comments)
          ? parsedData.comments
          : Array.isArray(parsedData.data)
          ? parsedData.data
          : [];
        const filtered = allComments.filter(
          (comment) => comment.post_id === parseInt(postId, 10)
        );
        setComments(filtered);
        setNewComment("");
        setShowCreateComment(false);
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  // Filter comments by search term (case-insensitive)
  const filteredComments = comments.filter((comment) =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        position: "relative",
        p: 3,
        bgcolor: "#121212",
        color: "#e0e0e0",
        borderRadius: 2
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Roboto Condensed, sans-serif" }}>
        {postTitle}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {postContent}
      </Typography>

      {/* Search bar for comments */}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <TextField
          label="Search comments"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{
            bgcolor: "#1e1e1e",
            input: { color: "#e0e0e0" },
            fieldset: { borderColor: "#00ff99" }
          }}
        />
      </Box>

      <Typography variant="h5" gutterBottom>
        Comments
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <List sx={{ mb: 4 }}>
          {filteredComments.map((comment) => {
            const formattedDate = comment.created_at
              ? format(new Date(comment.created_at), "dd MMM yyyy, h:mm a")
              : "Unknown Date";
            return (
              <Paper
                key={comment.id}
                sx={{ mb: 2, p: 2, bgcolor: "#1e1e1e", border: "1px solid #00ff99" }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {comment.username} • {formattedDate}
                </Typography>
                <ListItem disablePadding>
                  <ListItemText primary={comment.content} sx={{ color: "#e0e0e0" }} />
                </ListItem>
              </Paper>
            );
          })}
        </List>
      )}

      {/* Floating FAB for toggling create comment form */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        {showCreateComment ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowCreateComment(false)}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        ) : (
          <Fab color="primary" onClick={() => setShowCreateComment(true)}>
            <AddIcon />
          </Fab>
        )}
      </Box>

      {/* Floating create comment form */}
      {showCreateComment && (
        <Box
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width: "300px",
            p: 2,
            bgcolor: "rgba(30,30,30,0.95)",
            boxShadow: 10,
            borderRadius: 2,
            zIndex: 1000,
            border: "2px solid #00ff99"
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#00ff99" }}>
            Add Comment
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Comment"
              value={newComment}
              onChange={handleInputChange}
              multiline
              minRows={3}
              required
              sx={{
                input: { color: "#e0e0e0" },
                fieldset: { borderColor: "#00ff99" }
              }}
            />
            <Button variant="contained" type="submit" sx={{ bgcolor: "#00ff99", color: "#121212" }}>
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default PostPage;
