// //src/pages/HomePage.js

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import NavBar from '../components/NavBar';

// const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev'; // update this

// function HomePage() {
//   const [forums, setForums] = useState([]);
//   const [newTopic, setNewTopic] = useState('');

//   useEffect(() => {
//     fetch(`${API_BASE_URL}/getTopics`)
//       .then(res => res.json())
//       .then(data => {
//         console.log("Fetched data:", data);
//         let topics;
//         if (data.body) {
//           try {
//             const parsedBody = JSON.parse(data.body);
//             if (parsedBody.data && Array.isArray(parsedBody.data)) {
//               topics = parsedBody.data;
//             } else {
//               console.error("Parsed body does not contain an array in 'data'", parsedBody);
//             }
//           } catch (err) {
//             console.error("Error parsing body as JSON", err);
//           }
//         }
//         if (topics) {
//           setForums(topics);
//         } else {
//           console.error("Unexpected data format", data);
//         }
//       })
//       .catch(err => console.error('Error fetching forums:', err));
//   }, []);
  

//   // Handle the form submission for adding a new forum topic
//   const handleSubmit = (event) => {
//     event.preventDefault();

//     // Construct the payload for your POST request
//     const payload = {
//       title: newTopic
//       // Include additional fields if needed by your API
//     };

//     fetch(`${API_BASE_URL}/newTopic`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(payload)
//     })
//       .then(res => res.json())
//       .then(data => {
//         // Assuming the API returns the newly created topic in the same format
//         setForums([...forums, data]);
//         setNewTopic('');
//       })
//       .catch(err => console.error('Error adding forum topic:', err));
//   };

//   return (
//     <div>
//       <NavBar />
//       <h1>Forums</h1>
//       {/* Form to add a new forum topic */}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={newTopic}
//           onChange={(e) => setNewTopic(e.target.value)}
//           placeholder="Enter new forum topic"
//           required
//         />
//         <button type="submit">Add Topic</button>
//       </form>
//       {/* List of forum topics */}
//       <ul>
//         {forums.map(forum => (
//           <li key={forum.topic_id}>
//             <Link to={`/forum/${forum.topic_id}`}>{forum.name}</Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default HomePage;






//===========================================CHANGELOG 2===================================================


// src/pages/HomePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { AuthContext } from '../AuthContext';

const API_BASE_URL = 'https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev';

function HomePage() {
  const { token } = useContext(AuthContext);
  const [forums, setForums] = useState([]);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    if (!token) return; // ensure token is available before fetching
    fetch(`${API_BASE_URL}/getTopics`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched data:", data);
        let topics;
        if (data.body) {
          try {
            const parsedBody = JSON.parse(data.body);
            if (parsedBody.data && Array.isArray(parsedBody.data)) {
              topics = parsedBody.data;
            } else {
              console.error("Parsed body does not contain an array in 'data'", parsedBody);
            }
          } catch (err) {
            console.error("Error parsing body as JSON", err);
          }
        }
        if (topics) {
          setForums(topics);
        } else {
          console.error("Unexpected data format", data);
        }
      })
      .catch(err => console.error('Error fetching forums:', err));
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      title: newTopic,
    };

    fetch(`${API_BASE_URL}/newTopic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        setForums([...forums, data]);
        setNewTopic('');
      })
      .catch(err => console.error('Error adding forum topic:', err));
  };

  return (
    <div>
      <NavBar />
      <h1>Forums</h1>
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
