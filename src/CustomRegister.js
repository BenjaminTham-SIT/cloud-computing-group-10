// src/CustomRegister.js
import { useState } from "react";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import "./App.css";

const config = { region: "us-east-1" };
const cognitoClient = new CognitoIdentityProviderClient(config);
const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

function CustomRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async () => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const input = {
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email }
        ]
      };
      const command = new SignUpCommand(input);
      const response = await cognitoClient.send(command);
      console.log(response);
      setSuccessMsg("Registration successful! Please check your email to confirm your account.");
    } catch (error) {
      console.error(error);
      setErrorMsg("Registration failed: " + error.message);
    }
  };

  return (
    <div className="card">
      <h1>Register</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
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
      <br />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default CustomRegister;
