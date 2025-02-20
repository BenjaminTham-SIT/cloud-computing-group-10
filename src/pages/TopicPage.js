import React, { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  Paper,
  Box,
  CircularProgress,
  Fab,
  ListItem,
  ListItemText,
  MenuItem
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
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageURLs, setImageURLs] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [getfileType, setfileType] = useState("");
  const [getTest, setTest] = useState("");

  // Fetch posts for the given topic
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
        filtered.forEach((post) => {
          fetchImageFromS3(post.post_id)
            .then((imageData) => {
              if (imageData) {
                setImageURLs((prevURLs) => ({
                  ...prevURLs,
                  [post.post_id]: `data:image/jpeg;base64,${imageData}`
                }));
              }
            })
            .catch((error) => {
              console.error("Error fetching image for post", post.post_id, error);
            });
        });
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
    // Decode token to get user id
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
        return response.json();
      })
      .then((postResponse) => {
        console.log("New post response:", postResponse);
        const newPostId =
          postResponse.postId ||
          (postResponse.body && JSON.parse(postResponse.body).postId) ||
          postResponse.post_id ||
          (postResponse.body && JSON.parse(postResponse.body).post_id);
        if (!newPostId) {
          throw new Error("No post id returned from newPost API");
        }
        if (selectedFile) {
          return storeImageToS3(newPostId).then(() => newPostId);
        }
        return newPostId;
      })
      .then((newPostId) => {
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
        // Clear the form fields and image preview for a new submission
        setNewPost({ name: "", content: "" });
        setSelectedFile(null);
        setFilePreview(null);

        filtered.forEach((post) => {
          fetchImageFromS3(post.post_id)
            .then((imageData) => {
              if (imageData) {
                setImageURLs((prevURLs) => ({
                  ...prevURLs,
                  [post.post_id]: `data:image/jpeg;base64,${imageData}`
                }));
              }
            })
            .catch((error) => {
              console.error("Error fetching image for post", post.post_id, error);
            });
        });
      })
      .catch((error) => console.error("Error after creating post:", error));
  };

  // Handling file upload
  const formData = new FormData();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileContent = reader.result.split(",")[1];
      setFilePreview(reader.result);
      formData.append("content", fileContent);
      setfileType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const storeImageToS3 = (newPostId) => {
    const fileExtension = getfileType.split("/").pop().toLowerCase();
    const new_filename = `${topicId}_${newPostId}.${fileExtension}`;
    const base64Content = filePreview.split(",")[1];
    const payload = {
      content: base64Content,
      file_name: new_filename
    };
    return fetch(
      "https://h2ngxg46k3.execute-api.ap-southeast-2.amazonaws.com/test-stage/store-s3",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        return data;
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
  };

  const fetchImageFromS3 = async (postID) => {
    const new_postID = topicId + "_" + postID;
    try {
      const response = await fetch(
        "https://h2ngxg46k3.execute-api.ap-southeast-2.amazonaws.com/test-stage/retrieve-s3",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partial_name: new_postID })
        }
      );
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const parsedData = data.body ? JSON.parse(data.body) : data;
      const base64Image = parsedData.file_content;
      return base64Image || null;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter((post) =>
    post.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort posts by date – default is newest first
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, position: "relative" }}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Posts for {topicName}
          </Typography>

          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <TextField
              label="Search posts by title"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Sort by"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              variant="outlined"
              sx={{ width: "200px" }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </TextField>
          </Box>

          <List sx={{ mb: 4 }}>
            {sortedPosts.map((post) => {
              const formattedDate = post.created_at
                ? format(new Date(post.created_at), "dd MMM yyyy, h:mm a")
                : "Unknown Date";
              return (
                <Paper key={post.post_id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {post.username} • {formattedDate}
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    {imageURLs[post.post_id] && (
                      <img
                        src={imageURLs[post.post_id]}
                        alt={`Image for post ${post.post_id}`}
                        style={{ width: "300px" }}
                      />
                    )}
                  </Box>
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

          {/* Floating action button to open/close create post form */}
          <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
            {showCreatePost ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowCreatePost(false)}
                startIcon={<CloseIcon />}
              >
                Close
              </Button>
            ) : (
              <Fab color="primary" onClick={() => setShowCreatePost(true)}>
                <AddIcon />
              </Fab>
            )}
          </Box>

          {/* Floating expandable create post form */}
          {showCreatePost && (
            <Box
              sx={{
                position: "fixed",
                bottom: 80,
                right: 16,
                width: "300px",
                p: 2,
                bgcolor: "background.paper",
                boxShadow: 3,
                borderRadius: 2,
                zIndex: 1000
              }}
            >
              <Typography variant="h6" gutterBottom>
                Create Post
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
                {/* Upload button with file input */}
                <Button
                  variant="contained"
                  component="label"
                  sx={{ width: "fit-content" }}
                >
                  Upload Image/Video
                  <input
                    type="file"
                    accept="image/*, video/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                {/* If a file is selected, show a preview */}
                {filePreview && selectedFile && (
                  <Box
                    component="img"
                    src={filePreview}
                    alt="Selected Preview"
                    width="300px"
                  />
                )}
                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default TopicPage;
