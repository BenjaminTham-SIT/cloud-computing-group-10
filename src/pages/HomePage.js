import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev'; // update this

function HomePage() {
  const [forums, setForums] = useState([]);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/getTopics`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched data:", data);
        // Check if data.data exists and is an array
        if (data.data && Array.isArray(data.data)) {
          setForums(data.data);
        } else {
          console.error("Unexpected data format", data);
        }
      })
      .catch(err => console.error('Error fetching forums:', err));
  }, []);

  // Handle the form submission for adding a new forum topic
  const handleSubmit = (event) => {
    event.preventDefault();

    // Construct the payload for your POST request
    const payload = {
      title: newTopic
      // Include additional fields if needed by your API
    };

    fetch(`${API_BASE_URL}/newTopic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        // Assuming the API returns the newly created topic in the same format
        setForums([...forums, data]);
        setNewTopic('');
      })
      .catch(err => console.error('Error adding forum topic:', err));
  };

  return (
    <div>
      <NavBar />
      <h1>Forums</h1>
      {/* Form to add a new forum topic */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter new forum topic"
          required
        />
        <button type="submit">Add Topic</button>
      </form>
      {/* List of forum topics */}
      <ul>
        {forums.map(forum => (
          <li key={forum.topic_id}>
            <Link to={`/forum/${forum.topic_id}`}>{forum.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
