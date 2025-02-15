// src/CustomRegister.js
import { useState } from "react";
import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Link } from "react-router-dom";
import "./App.css";

const config = { region: "us-east-1" };
const cognitoClient = new CognitoIdentityProviderClient(config);
const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

function CustomRegister() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [view, setView] = useState("register"); // "register" or "confirm"

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
      setSuccessMsg("Email confirmed successfully! You can now log in.");
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
    </div>
  );
}

export default CustomRegister;
