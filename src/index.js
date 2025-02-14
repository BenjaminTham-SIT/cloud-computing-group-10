// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_dAD3lRUXx",
  clientId: "3c2ncrmuc1qiakldgkldndfg5n", // changed from client_id to clientId
  redirectUri: "https://main.d1qhf3toawkd0w.amplifyapp.com/", // changed from redirect_uri
  responseType: "code", // changed from response_type
  scope: "phone openid email",
  postLogoutRedirectUri: "https://main.d1qhf3toawkd0w.amplifyapp.com/", // changed from post_logout_redirect_uri
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
