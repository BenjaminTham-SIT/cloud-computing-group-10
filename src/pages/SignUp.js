import React, { useState } from "react";
import { signUp, confirmSignUp } from "@aws-amplify/auth";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const { user } = await signUp({
        username,
        password,
        attributes: { email },
      });
      console.log("Sign up successful", user);
      setShowConfirmation(true);
    } catch (err) {
      console.error("Error signing up", err);
      setError(err.message);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await confirmSignUp(username, confirmationCode);
      console.log("Confirmation successful");
      // Optionally, redirect to sign in or update app state.
    } catch (err) {
      console.error("Error confirming sign up", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>{showConfirmation ? "Confirm Sign Up" : "Sign Up"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!showConfirmation ? (
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          /><br/>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br/>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br/>
          <button type="submit">Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleConfirm}>
          <input
            type="text"
            placeholder="Confirmation Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
          /><br/>
          <button type="submit">Confirm Sign Up</button>
        </form>
      )}
    </div>
  );
};

export default SignUp;
