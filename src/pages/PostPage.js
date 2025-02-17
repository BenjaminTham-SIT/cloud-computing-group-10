// /pages/PostPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";


const PostPage = () => {
  const auth = useAuth();
  const { postId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const token = auth.user?.id_token;
  const formData = new FormData();
  

  // Fetch comments for this post (using post_id as a query parameter)
  // useEffect(() => {
  //   fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?post_id=${postId}`)
  //     .then((response) => response.json())
  //     .then((data) => setComments(data))
  //     .catch((error) => console.error("Error fetching comments:", error));
  // }, [postId]);

  // useEffect(() => {
  //   fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getPosts?post_id=${postId}`, {
  //     headers: token ? { Authorization: `Bearer ${token}` } : {}
  //   })
  //     .then((response) => response.json())
  //     .then((data) => setComments(data))
  //     .catch((error) => console.error("Error fetching comments:", error));
  // }, [postId, token]);


  // useEffect(() => {
  //   fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`, {
  //     headers: token ? { Authorization: `Bearer ${token}` } : {}
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // If the API response wraps your data in a "body" property, parse it first.
  //       const parsedData = data.body ? JSON.parse(data.body) : data;
  //       console.log("Parsed response:", parsedData);
  //       if (!Array.isArray(parsedData.data)) {
  //         console.error("Expected an array for comments, got:", parsedData.data);
  //         return;
  //       }
  //       setComments(parsedData.data);
  //     })
  //     .catch((error) => console.error("Error fetching comments:", error));
  // }, [postId, token]);
//   useEffect(() => {
//   fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`, {
//     headers: token ? { Authorization: `Bearer ${token}` } : {}
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       const parsedData = data.body ? JSON.parse(data.body) : data;
//       console.log("Parsed response:", parsedData);
//       let commentsArray;
//       if (Array.isArray(parsedData)) {
//         commentsArray = parsedData;
//       } else if (Array.isArray(parsedData.data)) {
//         commentsArray = parsedData.data;
//       } else {
//         console.error("Expected an array for comments, got:", parsedData);
//         return;
//       }
//       setComments(commentsArray);
//     })
//     .catch((error) => console.error("Error fetching comments:", error));
// }, [postId, token]);


useEffect(() => {
  fetch(`https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getComments?post_id=${postId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
    .then((response) => response.json())
    .then((data) => {
      const parsedData = data.body ? JSON.parse(data.body) : data;
      console.log("Parsed response:", parsedData);
      let commentsArray;
      if (Array.isArray(parsedData.comments)) {
        commentsArray = parsedData.comments;
      } else if (Array.isArray(parsedData.data)) {
        commentsArray = parsedData.data;
      } else {
        console.error("Expected an array for comments, got:", parsedData);
        return;
      }
      setComments(commentsArray);
    })
    .catch((error) => console.error("Error fetching comments:", error));
}, [postId, token]);


  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleNewCommentSubmit = (e) => {
    e.preventDefault();
    const commentData = {
      user_id: "currentUserId", // Replace with actual authenticated user id
      post_id: postId,
      content: newComment,
    };

    // fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(commentData),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setComments([...comments, data]);
    //     setNewComment("");
    //   })
    //   .catch((error) => console.error("Error creating comment:", error));

    // fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     ...(token && { Authorization: `Bearer ${token}` })
    //   },
    //   body: JSON.stringify(commentData),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setComments([...comments, data]);
    //     setNewComment("");
    //   })
    //   .catch((error) => console.error("Error creating comment:", error));

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(commentData),
    })
      .then((response) => response.json())
      .then((data) => {
        const parsedData = data.body ? JSON.parse(data.body) : data;
        // Assuming parsedData contains the new comment (or adjust accordingly)
        setComments([...comments, parsedData]);
        setNewComment("");

        if (!selectedFile) {
          alert('Please select a file first.');
          return;
        }
        else {
            // // once comment added in db, return commentid
            // const response = fetch('https://pwsgthrir2.execute-api.us-east-1.amazonaws.com/test-stage/upload-data-s3', {
            //   method: 'POST',
            //   body: formData,
            // });

            // if (response.ok) {
            //   alert('File uploaded successfully!');
            // } else {
            //   alert('File upload failed.');
            // }
        }

      })
      .catch((error) => console.error("Error creating comment:", error));

  };

  const handleCommentEdit = (commentId, currentContent) => {
    const updatedContent = prompt("Edit your comment:", currentContent);
    if (updatedContent) {
      const payload = {
        user_id: "currentUserId", // Replace with actual user id
        comment_id: commentId,
        content: updatedContent,
      };

      fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/updateComment", {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}`})
         },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((updatedComment) => {
          setComments(
            comments.map((comment) =>
              comment.id === commentId ? updatedComment : comment
            )
          );
        })
        .catch((error) => console.error("Error updating comment:", error));
    }
  };

  const handleCommentDelete = (commentId) => {
    const payload = {
      user_id: "currentUserId", // Replace with actual user id
      comment_id: commentId,
    };

    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/deleteComment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          setComments(comments.filter((c) => c.id !== commentId));
        }
      })
      .catch((error) => console.error("Error deleting comment:", error));
  };

  const handleFileChange = async (e) => {

    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      const fileContent = reader.result.split(',')[1];  // Get base64 content (strip off the 'data:*/*;base64,' part)
      setFilePreview(reader.result);
      const formData = new FormData();
      formData.append('content', fileContent);  // Append base64 content of the file
      formData.append('file_name', file.name);  // Append the file name

      fetch('https://pwsgthrir2.execute-api.us-east-1.amazonaws.com/test-stage/upload-data-s3', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
    };

    reader.readAsDataURL(file);
  };


  // TODO: Take in commentid as input, retrieve image (if any) for each comment
  const fetchImageFromS3 = async () => {
    try {
      const response = await fetch('https://pwsgthrir2.execute-api.us-east-1.amazonaws.com/test-stage/retrieve-data-s3');
      if (response.ok) {
        const data = await response.json();
        // Parse the body field to extract the file_content
        const responseBody = JSON.parse(data.body);
        // Extract the base64-encoded image content from the response body
        const base64Image = responseBody.file_content;
        // Create an image source using the base64 data
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        setImageURL(imageUrl);

      } else {
        alert('Failed to fetch image from S3');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  return (
    <div>
      <h1>Post: {postId}</h1>
      <h2>Comments</h2>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <p>{comment.content}</p>
            <button onClick={() => handleCommentEdit(comment.id, comment.content)}>
              Edit
            </button>
            <button onClick={() => handleCommentDelete(comment.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>Add a Comment</h2>
      <form onSubmit={handleNewCommentSubmit}>
        {filePreview && (
          <>
            {selectedFile.type.startsWith("image/") ? (
              <img src={filePreview} alt="Selected Preview" width="300" />
            ) : selectedFile.type.startsWith("video/") ? (
              <video width="300" controls>
                <source src={filePreview} type={selectedFile.type} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>Unsupported file type</p>
            )}
          </>
        )}
        <br></br>
        <input
          type="file"
          accept="image/*, video/*"
          onChange={handleFileChange}
        />
        
        {/* <button onClick={handleSubmit}>Submit</button> */}
        <br></br>
        <textarea
          value={newComment}
          onChange={handleNewCommentChange}
          placeholder="Your comment"
          required
        />
        <button type="submit">Post Comment</button>
      </form>
      <div>
        {/* Display the image if the URL is available */}
        {imageURL ? (
          <img src={imageURL} alt="Fetched from S3" style={{ width: '300px' }} />
        ) : (
          <button onClick={fetchImageFromS3}>Fetch Image from S3</button>
        )}
      </div>
    </div>
  );
};

export default PostPage;
