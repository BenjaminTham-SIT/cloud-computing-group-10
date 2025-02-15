// // src/CustomLogin.js
// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
// import { AuthContext } from "./AuthContext";
// import "./App.css";

// const config = { region: "us-east-1" };
// const cognitoClient = new CognitoIdentityProviderClient(config);
// const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

// function CustomLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [view, setView] = useState("login");
//   const [session, setSession] = useState("");
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     const input = {
//       AuthFlow: "USER_PASSWORD_AUTH",
//       AuthParameters: {
//         USERNAME: email,
//         PASSWORD: password,
//       },
//       ClientId: clientId,
//     };
//     const command = new InitiateAuthCommand(input);
//     const response = await cognitoClient.send(command);
//     console.log(response);
//     if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
//       setSession(response.Session);
//       setView("otp");
//     } else if (response.AuthenticationResult) {
//       // Save the access token (or any token you prefer)
//       login(response.AuthenticationResult.AccessToken);
//       navigate("/"); // redirect to the homepage
//     } else if (response["$metadata"]?.httpStatusCode === 200) {
//       alert("Login Successful, but token missing!");
//     }
//   };

//   const handleChallenge = async () => {
//     const input = {
//       ClientId: clientId,
//       ChallengeName: "NEW_PASSWORD_REQUIRED",
//       Session: session,
//       ChallengeResponses: {
//         NEW_PASSWORD: password,
//         USERNAME: email,
//       },
//     };
//     const command = new RespondToAuthChallengeCommand(input);
//     const response = await cognitoClient.send(command);
//     console.log(response);
//     if (response["$metadata"]?.httpStatusCode === 200) {
//       alert("Password Changed Successfully!");
//       setView("login");
//     }
//   };
 
//   return view === "login" ? (
//     <div className="card">
//         <h1>login - staging 1</h1>
//       <input
//         placeholder="Enter email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         placeholder="Enter password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <br />
//       <button onClick={handleLogin}>Login</button>
//     </div>
//   ) : (
//     <div className="card">
//       <input
//         placeholder="Enter new password"
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <br />
//       <button onClick={handleChallenge}>Save New Password</button>
//     </div>
//   );
// }

// export default CustomLogin;


// ====================================CHANGE LOG 2 ========================================================

// src/CustomLogin.js
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  RespondToAuthChallengeCommand 
} from "@aws-sdk/client-cognito-identity-provider";
import { AuthContext } from "./AuthContext";
import "./App.css";

const config = { region: "us-east-1" };
const cognitoClient = new CognitoIdentityProviderClient(config);
const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

function CustomLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState("login");
  const [session, setSession] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setErrorMsg(""); // clear previous error
      const input = {
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
        ClientId: clientId,
      };
      const command = new InitiateAuthCommand(input);
      const response = await cognitoClient.send(command);
      console.log(response);
      
      if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
        setSession(response.Session);
        setView("otp");
      } else if (response.AuthenticationResult) {
        login(response.AuthenticationResult.AccessToken);
        navigate("/"); // redirect to homepage
      } else if (response["$metadata"]?.httpStatusCode === 200) {
        // This branch rarely occurs, but you can handle it if needed.
        alert("Login Successful, but token missing!");
      }
    } catch (error) {
      console.error(error);
      if (error.name === "NotAuthorizedException") {
        setErrorMsg("Incorrect username or password.");
      } else {
        setErrorMsg("Login failed. Please try again.");
      }
    }
  };

  const handleChallenge = async () => {
    try {
      setErrorMsg("");
      const input = {
        ClientId: clientId,
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        Session: session,
        ChallengeResponses: {
          NEW_PASSWORD: password,
          USERNAME: email,
        },
      };
      const command = new RespondToAuthChallengeCommand(input);
      const response = await cognitoClient.send(command);
      console.log(response);
      if (response["$metadata"]?.httpStatusCode === 200) {
        alert("Password Changed Successfully!");
        setView("login");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to change password. Please try again.");
    }
  };

  return view === "login" ? (
    <div className="card">
      <h1>Login - staging 2</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <input
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <input
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password" // Mask the password input
      />
      <br />
      <button onClick={handleLogin}>Login</button>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  ) : (
    <div className="card">
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <input
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password" // Mask this input as well
      />
      <br />
      <button onClick={handleChallenge}>Save New Password</button>
    </div>
  );
}

export default CustomLogin;
