import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Alert,
  CircularProgress
} from "@mui/material";

function HomePage() {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ name: "", description: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to fetch topics from API
  const fetchTopics = () => {
    const token = sessionStorage.getItem("idToken");
    console.log(token);
    if (!token) {
      setErrorMessage("You must be logged in to view topics.");
      return;
    }
    setIsLoading(true);
    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getTopics", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized. Please log in first to see the topics.");
          }
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
        setTopics(parsedData.data);
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("Error fetching topics:", error);
        setErrorMessage(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  // Initial fetch of topics
  useEffect(() => {
    fetchTopics();
  }, []);

  const handleInputChange = (e) => {
    setNewTopic({ ...newTopic, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("idToken");
    if (!token) {
      setErrorMessage("You must be logged in to create topics.");
      return;
    }

    // Post new topic and then re-fetch the list so that the UI updates immediately.
    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newTopic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newTopic)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setNewTopic({ name: "", description: "" });
        // Re-fetch topics after new topic creation.
        fetchTopics();
      })
      .catch((error) => {
        console.error("Error creating topic:", error);
        setErrorMessage("Failed to create topic. Please try again.");
      });
  };

  // Filter topics by search term (case-insensitive)
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>Forum Topics</Typography>

      {/* Search bar */}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <TextField
          label="Search by Title"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Box>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredTopics.length > 0 ? (
            <List>
              {filteredTopics.map((topic) => (
                <Paper key={topic.topic_id} sx={{ mb: 2 }}>
                  <ListItem
                    button
                    component={Link}
                    to={`/topic/${topic.topic_id}`}
                    state={{ topicName: topic.name }}
                  >
                    <ListItemText primary={topic.name} secondary={topic.description} />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No topics found.
            </Typography>
          )}

          {/* Form to create a new topic */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Create a New Topic
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", gap: 2, flexDirection: "column", maxWidth: "400px" }}
          >
            <TextField
              label="Topic Name"
              name="name"
              value={newTopic.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Description"
              name="description"
              value={newTopic.description}
              onChange={handleInputChange}
              required
            />
            <Button variant="contained" type="submit">
              Create Topic
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}

export default HomePage;
