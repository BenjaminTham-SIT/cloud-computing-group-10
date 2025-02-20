import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  Box,
  CircularProgress,
  Fab,
  ListItem,
  ListItemText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const TopicPage = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const topicName = location.state?.topicName || "Unknown Topic";

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ name: "", content: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    console.log("Topic ID:", topicId);
    const token = sessionStorage.getItem("idToken");
    if (!token) {
      console.error("No token found; user not logged in?");
      setIsLoading(false);
      return;
    }
    fetch(
      `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?topicId=${topicId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        if (!Array.isArray(parsedData.data)) {
          console.error("Expected an array but got:", parsedData.data);
          return;
        }
        const filtered = parsedData.data.filter(
          (post) => post.topic_id === parseInt(topicId, 10)
        );
        setPosts(filtered);
      })
      .catch((error) => console.error("Error fetching posts:", error))
      .finally(() => setIsLoading(false));
  }, [topicId]);

  const handleInputChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("idToken");
    if (!token) {
      console.error("No token found; user not logged in");
      return;
    }
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;

    const postData = {
      user_id: userID,
      topic_id: topicId,
      name: newPost.name,
      content: newPost.content
    };

    console.log("Post Data:", postData);

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(response);
        return response.json();
      })
      .then(() => {
        return fetch(
          `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?topicId=${topicId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((response) => response.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        if (!Array.isArray(parsedData.data)) {
          console.error("Expected an array but got:", parsedData.data);
          return;
        }
        const filtered = parsedData.data.filter(
          (post) => post.topic_id === parseInt(topicId, 10)
        );
        setPosts(filtered);
        setShowCreatePost(false);
      })
      .catch((error) => console.error("Error after creating post:", error));
  };

  const filteredPosts = posts.filter((post) =>
    post.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, position: "relative", p: 3, bgcolor: "#121212", color: "#e0e0e0", borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Roboto Condensed, sans-serif" }}>
        Posts for {topicName}
      </Typography>

      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <TextField
          label="Search posts by title"
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

      <List sx={{ mb: 4 }}>
        {filteredPosts.map((post) => {
          const formattedDate = post.created_at
            ? format(new Date(post.created_at), "dd MMM yyyy, h:mm a")
            : "Unknown Date";
          return (
            <Paper key={post.post_id} sx={{ mb: 2, p: 2, bgcolor: "#1e1e1e", border: "1px solid #00ff99" }}>
              <Typography variant="subtitle2" color="text.secondary">
                {post.username} • {formattedDate}
              </Typography>
              <ListItem
                button
                component={Link}
                to={`/post/${post.post_id}`}
                state={{ postTitle: post.name, postContent: post.content }}
              >
                <ListItemText primary={post.name} secondary={post.content} sx={{ color: "#e0e0e0" }}/>
              </ListItem>
            </Paper>
          );
        })}
      </List>

      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        {showCreatePost ? (
          <Button variant="contained" color="secondary" onClick={() => setShowCreatePost(false)} startIcon={<CloseIcon />}>
            Close
          </Button>
        ) : (
          <Fab color="primary" onClick={() => setShowCreatePost(true)}>
            <AddIcon />
          </Fab>
        )}
      </Box>

      {showCreatePost && (
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
          <Typography variant="h6" gutterBottom sx={{ color: "#00ff99" }}>Create Post</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Post Title"
              name="name"
              value={newPost.name}
              onChange={handleInputChange}
              required
              sx={{
                input: { color: "#e0e0e0" },
                fieldset: { borderColor: "#00ff99" }
              }}
            />
            <TextField
              label="Content"
              name="content"
              value={newPost.content}
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

export default TopicPage;
