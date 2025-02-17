// /pages/HomePage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

const HomePage = () => {
    
  const auth = useAuth();
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ name: "", description: "" });

  // Fetch all topics on component mount
  useEffect(() => {
    const token = auth.user?.id_token; // Get the access token if available
    const userID = auth.user?.userID;

    console.log("id token   " + auth.user?.id_token);
    console.log("access token   " + auth.user?.access_token);
    
    console.log("user id  " + userID);
    
    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/getTopics", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
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
        setTopics(parsedData.data);
      })
      .catch((error) => console.error("Error fetching topics:", error));
  }, [auth]);

  const handleInputChange = (e) => {
    setNewTopic({ ...newTopic, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting new topic:", newTopic);
    const token = auth.user?.id_token; // Retrieve the token again
    fetch("https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev/newTopic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(newTopic),
    })
      .then((response) => response.json())
      .then((data) => {
        // Optionally, refresh topics list after creation
        console.log("setting new topic:", newTopic);
        setTopics([...topics, data]);
        setNewTopic({ name: "", description: "" });
      })
      .catch((error) => console.error("Error creating topic:", error));
  };
  

  return (
    <div>
      <h1>Forum Topics</h1>
      <ul>
        {topics.map((topic) => (
          <li key={topic.id}>
            {/* Assumes each topic has an 'id', 'name', and 'description' */}
            <Link to={`/topic/${topic.id}`}>{topic.name}</Link>
            <p>{topic.description}</p>
          </li>
        ))}
      </ul>

      <h2>Create a New Topic</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Topic Name"
          value={newTopic.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newTopic.description}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Create Topic</button>
      </form>
    </div>
  );
};

export default HomePage;
