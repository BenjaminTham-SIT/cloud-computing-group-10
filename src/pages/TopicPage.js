import React, { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { format } from 'date-fns';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  CircularProgress
} from "@mui/material";

const TopicPage = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const topicName = location.state?.topicName || "Unknown Topic";

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ name: "", content: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch posts for the given topic
  useEffect(() => {
    setIsLoading(true);
    console.log(topicId)

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

    // decode token to get user id
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;

    const postData = {
      user_id: userID,
      topic_id: topicId,
      name: newPost.name,
      content: newPost.content
    };

    console.log(postData)
    // console.log(topicId)
    // console.log(newPost.name)
    // console.log(newPost.content)


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
        // re-fetch posts to show new one
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
      })
      .catch((error) => console.error("Error after creating post:", error));
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
            Posts for {topicName}
          </Typography>

          <List sx={{ mb: 4 }}>
            {posts.map((post) => {
              // Convert the created_at timestamp into a readable format
              const formattedDate = post.created_at
                ? format(new Date(post.created_at), "dd MMM yyyy, h:mm a")
                : "Unknown Date";

              return (
                <Paper key={post.post_id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {post.username} • {formattedDate}
                  </Typography>
                  <ListItem
                    button
                    component={Link}
                    to={`/post/${post.post_id}`}
                    state={{ postTitle: post.name, postContent: post.content }}
                  >
                    <ListItemText primary={post.name} secondary={post.content} />
                  </ListItem>
                </Paper>
              );
            })}
          </List>


          <Typography variant="h5" gutterBottom>
            Create a New Post
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: "400px" }}
          >
            <TextField
              label="Post Title"
              name="name"
              value={newPost.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Content"
              name="content"
              value={newPost.content}
              onChange={handleInputChange}
              multiline
              minRows={3}
              required
            />
            <Button variant="contained" type="submit">
              Create Post
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default TopicPage;
