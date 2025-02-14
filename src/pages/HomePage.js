import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev'; // update this

function HomePage() {
  const [forums, setForums] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/getTopics`)
      .then(res => res.json())
      .then(data => setForums(data))
      .catch(err => console.error('Error fetching forums:', err));
  }, []);

  return (
    <div>
      <h1>Forums</h1>
      <ul>
        {forums.map(forum => (
          <li key={forum.id}>
            <Link to={`/forum/${forum.id}`}>{forum.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
