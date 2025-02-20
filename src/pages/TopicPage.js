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
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageURLs, setImageURLs] = useState([]); 
  const [filePreview, setFilePreview] = useState(null);
  const [getfileType, setfileType] = useState("");
  const [getTest, setTest] = useState("");

  // Fetch posts for the given topic
  useEffect(() => {

    setIsLoading(true);

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

        // Iterate over each filtered post and call fetchImageFromS3 using post.post_id
        // filtered.forEach((post) => {
        //   fetchImageFromS3(post.post_id)
        //     .then((imageData) => {

        //       // Handle imageData here

        //       // const parsedData = imageData.body ? JSON.parse(imageData.body) : imageData;
        //       // console.log("AUGGHGHH PARSED DATA"+parsedData)
        //       // setImageURLs(imageData);
        //       setImageURLs((prevURLs) => ({
        //         ...prevURLs,
        //         [post.post_id]: `data:image/jpeg;base64,${imageData}`
        //       }));
        //     })
        //     .catch((error) => {
        //       console.error("Error fetching image for post", post.post_id, error);
        //     });
            
        // });
        
        filtered.forEach((post) => {
          fetchImageFromS3(post.post_id)
            .then((imageData) => {
              if (imageData) {  // Only update if imageData is valid
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

    // decode token to get user id
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const userID = tokenPayload.sub;

    const postData = {
      user_id: userID,
      topic_id: topicId,
      name: newPost.name,
      content: newPost.content
    };

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
      .then(() => {
        // Store image only after the post has been successfully added
        // storeImageToS3();
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
  
  const storeImageToS3 = async () => {
    const fileExtension = getfileType.split('/').pop().toLowerCase();
    const new_filename = topicId + "." + fileExtension;
    formData.append("file_name", new_filename);

    alert("Image uploaded to S3 - " + new_filename)

    // Call API to store image added into the comment
    fetch(
      "https://h2ngxg46k3.execute-api.ap-southeast-2.amazonaws.com/test-stage/store-s3",
      { method: "POST", body: formData }
    )
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  }

  // const fetchImageFromS3 = async (postID) => {
  //   const new_postID = topicId + "_" + postID;
  //   try {
  //     const response = await fetch(
  //       "https://h2ngxg46k3.execute-api.ap-southeast-2.amazonaws.com/test-stage/retrieve-s3",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ partial_name: new_postID })
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     console.log("Parsed response:", data);
  //     // Process the base64 image, for example:
  //     const base64Image = data.file_content;
  //     // Update your state here if needed
  //     setTest(base64Image);
  //     return base64Image;
  //   } catch (error) {
  //     console.error("Error fetching image:", error);
  //     return null;
  //   }
  // };
  
//   const fetchImageFromS3 = async (postID) => {
//   const new_postID = topicId + "_" + postID;
//   console.log("show me the id "+JSON.stringify(new_postID))
//   try {
//     const response = await fetch(
//       "https://h2ngxg46k3.execute-api.ap-southeast-2.amazonaws.com/test-stage/retrieve-s3",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ "partial_name": new_postID })
//       }
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     // Parse the nested JSON string in the body
//     const parsedData = data.body ? JSON.parse(data.body) : data;
//     const base64Image = parsedData.file_content;
//     return base64Image;
//   } catch (error) {
//     console.error("Error fetching image:", error);
//     return null;
//   }
// };

const fetchImageFromS3 = async (postID) => {
  const new_postID = topicId + "_" + postID;
  console.log("show me the id " + JSON.stringify(new_postID));
  try {
    const response = await fetch(
      "https://h2ngxg46k3.execute-api.ap-southeast-2.amazonaws.com/test-stage/retrieve-s3",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "partial_name": new_postID })
      }
    );
    
    // If the response status indicates that no image was found, return null.
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const parsedData = data.body ? JSON.parse(data.body) : data;
    const base64Image = parsedData.file_content;
    
    // Check if the returned file content is valid.
    if (!base64Image) {
      return null;
    }
    
    return base64Image;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
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
              
              // fetchImageFromS3(post.post_id)

              return (
                <Paper key={post.post_id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ mt: 3 }}>
                  {imageURLs[post.post_id] && (
  <img
    src={imageURLs[post.post_id]}
    alt={`Image for post ${post.post_id}`}
    style={{ width: "300px" }}
  />
)}

                  </Box>
                  <Box
                    component="img"
                    src={filePreview}
                    width="300px"
                  />
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
            
            {filePreview && selectedFile ? (
              <>
                {selectedFile.type.startsWith("image/") ? (
                  <Box
                    component="img"
                    src={filePreview}
                    alt="Selected Preview"
                    width="300px"
                  />
                ) : selectedFile.type.startsWith("video/") ? (
                  <video width="300" controls>
                    <source src={filePreview} type={selectedFile.type} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Typography color="text.secondary">Unsupported file type</Typography>
                )}
              </>
            ) : (
              // Display default image when no file is selected
              <Box
                component="img"
                src="/poc.png"
                alt="Default Preview"
                width="500px"
              />
            )}
            <Box sx={{ mt: 3 }}>
            {getTest ? (
              <img src={getTest} alt="Fetched from S3" style={{ width: "300px" }} />
            ) : (
              <Button variant="outlined" onClick={fetchImageFromS3("21")}>
                Fetch Image from S3
              </Button>
            )}
          </Box>
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
