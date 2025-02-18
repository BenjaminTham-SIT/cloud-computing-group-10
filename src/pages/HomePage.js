



// HomePage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
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
  CircularProgress  // <-- MUI Spinner
} from "@mui/material";

const HomePage = () => {
  const auth = useAuth();
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ name: "", description: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // <-- New loading state

  useEffect(() => {
    const token = auth.user?.id_token;

    // If no token, show an error message immediately (skip fetch)
    if (!token) {
      setErrorMessage("You must be logged in to view topics.");
      return;
    }

    // Start loading
    setIsLoading(true);

    // If we do have a token, fetch topics
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
      .finally(() => {
        // Always end loading state, success or error
        setIsLoading(false);
      });
  }, [auth]);

  const handleInputChange = (e) => {
    setNewTopic({ ...newTopic, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = auth.user?.id_token;
    if (!token) {
      setErrorMessage("You must be logged in to create topics.");
      return;
    }

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newTopic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newTopic)
    })
      .then((response) => response.json())
      .then((data) => {
        setTopics([...topics, data]);
        setNewTopic({ name: "", description: "" });
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("Error creating topic:", error);
        setErrorMessage("Failed to create topic. Please try again.");
      });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        Forum Topics
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      {/* If currently loading, show the spinner and skip the rest */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Only show topics if we actually have some loaded */}
          {topics.length > 0 && (
            <List>
              {topics.map((topic) => (
                <Paper key={topic.topic_id} sx={{ mb: 2 }}>
                  <ListItem
                    button
                    component={Link}
                    to={`/topic/${topic.topic_id}`}
                    state={{ topicName: topic.name }}
                  >
                    <ListItemText
                      primary={topic.name}
                      secondary={topic.description}
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}

          {/* Conditionally show the "Create a New Topic" form only if the user is authenticated */}
          {auth.isAuthenticated ? (
            <>
              <Typography variant="h5" gutterBottom>
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
          ) : (
            <Typography variant="body1" sx={{ mt: 4 }}>
              Please log in to create new topics.
            </Typography>
          )}
        </>
      )}
    </Container>
  );
};

export default HomePage;
