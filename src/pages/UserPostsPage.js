import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress, List, Paper, ListItem, ListItemText } from "@mui/material";

const UserPostsPage = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState({ username: "", posts: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts for the given topic
    useEffect(() => {
      setIsLoading(true);
  
      const token = sessionStorage.getItem("idToken");
      if (!token) {
        console.error("No token found; user not logged in?");
        setIsLoading(false);
        return;
      }

      const payload = {
        username: username
      };

      console.log(payload);
      console.log("Username: " + username);
      fetch(
        `https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getUserPost`,
        { 
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
            console.log(data);
          const parsedData = data.body ? JSON.parse(data.body) : data;
          if (!Array.isArray(parsedData.data)) {
            console.error("Expected an array but got:", parsedData.data);
            return;
          }

          setUserData({
            username: username,
            posts: parsedData.data
          });
          
        })
        
        .catch((error) => console.error("Error fetching posts:", error))
        .finally(() => setIsLoading(false));
    }, [username]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {isLoading ? (
        <CircularProgress sx={{ display: "block", margin: "auto" }} />
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Posts by {userData.username}
          </Typography>
          <List>
            {userData.posts.length > 0 ? (
              userData.posts.map((post) => (
                <Paper key={post.post_id} sx={{ mb: 2, p: 2 }}>
                  <ListItem button>
                    <ListItemText primary={post.name} secondary={post.content} />
                  </ListItem>
                </Paper>
              ))
            ) : (
              <Typography>No posts available.</Typography>
            )}
          </List>
        </>
      )}
    </Container>
  );
};

export default UserPostsPage;
