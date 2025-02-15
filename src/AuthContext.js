import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

export const AuthContext = createContext();

const config = { region: "us-east-1" };
const cognitoClient = new CognitoIdentityProviderClient(config);
const clientId = "3c2ncrmuc1qiakldgkldndfg5n";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Helper: Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token);
      return Date.now() >= exp * 1000;
    } catch (e) {
      return true;
    }
  };

  const refreshAuthToken = async () => {
    try {
      const input = {
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
        ClientId: clientId,
      };
      const command = new InitiateAuthCommand(input);
      const response = await cognitoClient.send(command);
      if (response.AuthenticationResult) {
        const newToken = response.AuthenticationResult.AccessToken;
        setToken(newToken);
        localStorage.setItem("accessToken", newToken);
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
    }
  };

  const login = (newToken, newRefreshToken) => {
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedToken && storedRefreshToken) {
      if (isTokenExpired(storedToken)) {
        refreshAuthToken();
      } else {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
      }
    }
  }, []);

  // Optionally, set up an interval to refresh the token periodically

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
