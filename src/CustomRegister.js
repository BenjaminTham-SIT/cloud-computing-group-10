// // src/CustomRegister.js
// import { useState } from "react";
// import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
// import { Link } from "react-router-dom";
// import "./App.css";

// const config = { region: "us-east-1" };
// const cognitoClient = new CognitoIdentityProviderClient(config);
// const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

// function CustomRegister() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [confirmationCode, setConfirmationCode] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const [view, setView] = useState("register"); // "register" or "confirm"

//   const handleRegister = async () => {
//     setErrorMsg("");
//     setSuccessMsg("");

//     if (password !== confirmPassword) {
//       setErrorMsg("Passwords do not match.");
//       return;
//     }

//     try {
//       const input = {
//         ClientId: clientId,
//         Username: username, // use a separate username, not an email alias
//         Password: password,
//         UserAttributes: [
//           { Name: "email", Value: email }
//         ]
//       };
//       const command = new SignUpCommand(input);
//       const response = await cognitoClient.send(command);
//       console.log(response);
//       setSuccessMsg("Registration successful! Please check your email for the confirmation code.");
//       setView("confirm");
//     } catch (error) {
//       console.error(error);
//       setErrorMsg("Registration failed: " + error.message);
//     }
//   };

//   const handleConfirm = async () => {
//     setErrorMsg("");
//     setSuccessMsg("");

//     try {
//       const input = {
//         ClientId: clientId,
//         Username: username,
//         ConfirmationCode: confirmationCode,
//       };
//       const command = new ConfirmSignUpCommand(input);
//       const response = await cognitoClient.send(command);
//       console.log(response);
//       setSuccessMsg("Email confirmed successfully! You can now log in.");
//     } catch (error) {
//       console.error(error);
//       setErrorMsg("Confirmation failed: " + error.message);
//     }
//   };

//   return view === "register" ? (
//     <div className="card">
//       <h1>Register</h1>
//       {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
//       {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
//       <input
//         type="text"
//         placeholder="Enter username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <input
//         type="email"
//         placeholder="Enter email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Enter password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Confirm password"
//         value={confirmPassword}
//         onChange={(e) => setConfirmPassword(e.target.value)}
//       />
//       <br />
//       <button onClick={handleRegister}>Register</button>
//       <p>
//         Have an account? <Link to="/login">Login here</Link>
//       </p>
//     </div>
//   ) : (
//     <div className="card">
//       <h1>Confirm Registration</h1>
//       {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
//       {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
//       <input
//         type="text"
//         placeholder="Enter confirmation code"
//         value={confirmationCode}
//         onChange={(e) => setConfirmationCode(e.target.value)}
//       />
//       <br />
//       <button onClick={handleConfirm}>Confirm Email</button>
//     </div>
//   );
// }

// export default CustomRegister;




// ========================================================CHANGELOG 2===================================================================


// src/CustomRegister.js
// import { useState } from "react";
// import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
// import { Link } from "react-router-dom";
// import "./App.css";

// const config = { region: "us-east-1" };
// const cognitoClient = new CognitoIdentityProviderClient(config);
// const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

// // Base URL for your topics API
// const API_BASE_URL = "https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev";

// function CustomRegister() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [confirmationCode, setConfirmationCode] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const [view, setView] = useState("register"); // "register" or "confirm"
//   const [topics, setTopics] = useState([]); // For testing API call after confirmation

//   const handleRegister = async () => {
//     setErrorMsg("");
//     setSuccessMsg("");

//     if (password !== confirmPassword) {
//       setErrorMsg("Passwords do not match.");
//       return;
//     }

//     try {
//       const input = {
//         ClientId: clientId,
//         Username: username, // use a separate username, not an email alias
//         Password: password,
//         UserAttributes: [
//           { Name: "email", Value: email }
//         ]
//       };
//       const command = new SignUpCommand(input);
//       const response = await cognitoClient.send(command);
//       console.log(response);
//       setSuccessMsg("Registration successful! Please check your email for the confirmation code.");
//       setView("confirm");
//     } catch (error) {
//       console.error(error);
//       setErrorMsg("Registration failed: " + error.message);
//     }
//   };

//   const handleConfirm = async () => {
//     setErrorMsg("");
//     setSuccessMsg("");

//     try {
//       const input = {
//         ClientId: clientId,
//         Username: username,
//         ConfirmationCode: confirmationCode,
//       };
//       const command = new ConfirmSignUpCommand(input);
//       const response = await cognitoClient.send(command);
//       console.log(response);
//       if (response["$metadata"]?.httpStatusCode === 200) {
//         setSuccessMsg("Email confirmed successfully! You can now log in.");
//         // Fetch topics from the API after successful confirmation
//         fetch(`${API_BASE_URL}/getTopics`)
//           .then(res => res.json())
//           .then(data => {
//             console.log("Fetched topics:", data);
//             let topicsArray;
//             if (data.body) {
//               try {
//                 const parsedBody = JSON.parse(data.body);
//                 if (parsedBody.data && Array.isArray(parsedBody.data)) {
//                   topicsArray = parsedBody.data;
//                 } else {
//                   console.error("Parsed body does not contain an array in 'data'", parsedBody);
//                 }
//               } catch (err) {
//                 console.error("Error parsing body as JSON", err);
//               }
//             }
//             if (topicsArray) {
//               setTopics(topicsArray);
//             } else {
//               console.error("Unexpected data format", data);
//             }
//           })
//           .catch(err => console.error("Error fetching topics:", err));
//       }
//     } catch (error) {
//       console.error(error);
//       setErrorMsg("Confirmation failed: " + error.message);
//     }
//   };

//   return view === "register" ? (
//     <div className="card">
//       <h1>Register</h1>
//       {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
//       {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
//       <input
//         type="text"
//         placeholder="Enter username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <input
//         type="email"
//         placeholder="Enter email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Enter password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Confirm password"
//         value={confirmPassword}
//         onChange={(e) => setConfirmPassword(e.target.value)}
//       />
//       <br />
//       <button onClick={handleRegister}>Register</button>
//       <p>
//         Have an account? <Link to="/login">Login here</Link>
//       </p>
//     </div>
//   ) : (
//     <div className="card">
//       <h1>Confirm Registration</h1>
//       {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
//       {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
//       <input
//         type="text"
//         placeholder="Enter confirmation code"
//         value={confirmationCode}
//         onChange={(e) => setConfirmationCode(e.target.value)}
//       />
//       <br />
//       <button onClick={handleConfirm}>Confirm Email</button>
//       {/* Display topics fetched from the API */}
//       {topics.length > 0 && (
//         <div>
//           <h2>Topics:</h2>
//           <ul>
//             {topics.map(topic => (
//               <li key={topic.topic_id}>{topic.name}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CustomRegister;






// ========================================================CHANGELOG 3===================================================================




import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand 
} from "@aws-sdk/client-cognito-identity-provider";
import "./App.css";

const config = { region: "us-east-1" };
const cognitoClient = new CognitoIdentityProviderClient(config);
const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

// Base URL for your topics API
const API_BASE_URL = "https://6kz844frt5.execute-api.us-east-1.amazonaws.com/dev";

function CustomRegister() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [view, setView] = useState("register"); // "register" or "confirm"
  const [topics, setTopics] = useState([]); // For testing API call after confirmation

  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const input = {
        ClientId: clientId,
        Username: username, // use a separate username, not an email alias
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email }
        ]
      };
      const command = new SignUpCommand(input);
      const response = await cognitoClient.send(command);
      console.log(response);
      setSuccessMsg("Registration successful! Please check your email for the confirmation code.");
      setView("confirm");
    } catch (error) {
      console.error(error);
      setErrorMsg("Registration failed: " + error.message);
    }
  };

  const handleConfirm = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const input = {
        ClientId: clientId,
        Username: username,
        ConfirmationCode: confirmationCode,
      };
      const command = new ConfirmSignUpCommand(input);
      const response = await cognitoClient.send(command);
      console.log(response);
      if (response["$metadata"]?.httpStatusCode === 200) {
        setSuccessMsg("Email confirmed successfully! You can now log in.");
        // Optionally fetch topics from your API for testing
        fetch(`${API_BASE_URL}/getTopics`)
          .then(res => res.json())
          .then(data => {
            console.log("Fetched topics:", data);
            let topicsArray;
            if (data.body) {
              try {
                const parsedBody = JSON.parse(data.body);
                if (parsedBody.data && Array.isArray(parsedBody.data)) {
                  topicsArray = parsedBody.data;
                } else {
                  console.error("Parsed body does not contain an array in 'data'", parsedBody);
                }
              } catch (err) {
                console.error("Error parsing body as JSON", err);
              }
            }
            if (topicsArray) {
              setTopics(topicsArray);
            } else {
              console.error("Unexpected data format", data);
            }
          })
          .catch(err => console.error("Error fetching topics:", err));
        // Redirect to homepage after 3 seconds (adjust delay as needed)
        setTimeout(() => {
          navigate("/");
        }, 10000);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Confirmation failed: " + error.message);
    }
  };

  return view === "register" ? (
    <div className="card">
      <h1>Register</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <br />
      <button onClick={handleRegister}>Register</button>
      <p>
        Have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  ) : (
    <div className="card">
      <h1>Confirm Registration</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      <input
        type="text"
        placeholder="Enter confirmation code"
        value={confirmationCode}
        onChange={(e) => setConfirmationCode(e.target.value)}
      />
      <br />
      <button onClick={handleConfirm}>Confirm Email</button>
      {/* Display topics fetched from the API */}
      {topics.length > 0 && (
        <div>
          <h2>Topics:</h2>
          <ul>
            {topics.map(topic => (
              <li key={topic.topic_id}>{topic.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomRegister;


