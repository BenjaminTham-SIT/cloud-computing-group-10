// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";


const cognitoAuthConfig = {
  authority: "https://us-east-1dad3lruxx.auth.us-east-1.amazoncognito.com",
  client_id: "3c2ncrmuc1qiakldgkldndfg5n",
  redirect_uri: "https://main.d1qhf3toawkd0w.amplifyapp.com/",
  response_type: "code",
  scope: "phone openid email",
  post_logout_redirect_uri: "https://main.d1qhf3toawkd0w.amplifyapp.com/", // add this line
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
