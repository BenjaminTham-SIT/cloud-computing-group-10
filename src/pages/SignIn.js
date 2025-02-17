import React, { useState } from "react";
import { signIn } from "@aws-amplify/auth";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signIn(username, password);
      console.log("Sign in successful", user);
      // Handle sign-in success, e.g., update app state or redirect.
    } catch (err) {
      console.error("Error signing in", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;
