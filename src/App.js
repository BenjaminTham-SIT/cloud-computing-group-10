//====================================================== CHECKPOINT 1 ======================================================================================================


// src/App.js
// import React , {useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { useAuth } from 'react-oidc-context';
// import HomePage from './pages/HomePage';
// import ForumPage from './pages/ForumPage';
// import PostPage from './pages/PostPage';
// import ProtectedRoute from './components/ProtectedRoute';
// import { fetchAuthSession } from 'aws-amplify/auth';


// const cognitoAuthConfig = {
//   authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_dAD3lRUXx",
//   client_id: "3c2ncrmuc1qiakldgkldndfg5n",
//   redirect_uri: "https://main.d1qhf3toawkd0w.amplifyapp.com/",
//   response_type: "code",
//   scope: "phone openid email",
//   post_logout_redirect_uri: "https://main.d1qhf3toawkd0w.amplifyapp.com/", // add this line
// };

// async function getIdToken() {
//   try {
//     const session = await fetchAuthSession(); // ✅ New way to fetch session in v5+
//     const idToken = session.tokens?.idToken?.toString();  // ✅ Get ID Token
//     console.log('ID Token:', idToken);
//     return idToken;
//   } catch (error) {
//     console.error('Error getting ID Token:', error);
//   }
// }

// function App() {
//   const auth = useAuth();

//   useEffect(() => {
//     if (auth.isAuthenticated && auth.user) {
//       // console.log("Access Token:", auth.user.access_token);
//       // console.log("User:", auth.user);
//       getIdToken();
//     }
//   }, [auth.isAuthenticated, auth.user]);

//   if (auth.isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (auth.error) {
//     return <div>Error: {auth.error.message}</div>;
//   }

//   return (
//     <div>
//       <header style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
//         {auth.isAuthenticated ? (
//           <div>
//             <span>Hello User, {auth.user?.profile.email}</span>
//             {' '}
//             <button onClick={() => auth.signoutRedirect()}>Sign Out 2</button>
//           </div>
//         ) : (
//           <div>
//             <button onClick={() => auth.signinRedirect()}>Sign In</button>
//           </div>
//         )}
//       </header>
//       <Router>
//         <Routes>
//           <Route path="/" element={
//             <ProtectedRoute>
//               <HomePage />
//             </ProtectedRoute>
//           }/>
//           <Route path="/forum/:forumId" element={
//             <ProtectedRoute>
//               <ForumPage />
//             </ProtectedRoute>
//           }/>
//           <Route path="/post/:postId" element={
//             <ProtectedRoute>
//               <PostPage />
//             </ProtectedRoute>
//           }/>
//         </Routes>
//       </Router>
//     </div>
//   );
// }

// export default App;


//====================================================== CHECKPOINT 2 ======================================================================================================


// import { useState } from 'react'
// import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
// import './App.css'

// const config = { region: "us-east-1" }

// const cognitoClient = new CognitoIdentityProviderClient(config);
// const clientId = "3c2ncrmuc1qiakldgkldndfg5n"

// function App() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [view, setView] = useState("login");
//   const [session, setSession] = useState("");

//   const handleLogin = async () => {
//     const input = {
//       "AuthFlow": "USER_PASSWORD_AUTH",
//       "AuthParameters": {
//         "USERNAME": email,
//         "PASSWORD": password,
//       },
//       "ClientId": clientId,
//     };
//     const command = new InitiateAuthCommand(input);
//     const response = await cognitoClient.send(command);

//     console.log(response)
//     if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
//       setSession(response.Session)
//       setView('otp')
//     }
//     else if (response['$metadata']['httpStatusCode'] === 200) alert("Login Successfull!")
//   }

//   const handleChallenge = async () => {
//     const input = { // RespondToAuthChallengeRequest
//       ClientId: clientId, // required
//       ChallengeName: "NEW_PASSWORD_REQUIRED",
//       Session: session,
//       ChallengeResponses: {
//         "NEW_PASSWORD": password, "USERNAME": email
//       },
//     };
//     const command = new RespondToAuthChallengeCommand(input);
//     const response = await cognitoClient.send(command);
//     console.log(response)
//     if (response['$metadata']['httpStatusCode'] === 200) { alert("Password Changed Successfully!"); setView('login') }
//   }

//   return (view === "login" ?
//     <div className='card'>
//       <input placeholder='Enter email' value={email} onChange={e => setEmail(e.target.value)} />
//       <input placeholder='Enter password' value={password} onChange={e => setPassword(e.target.value)} />
//       <br />
//       <button onClick={handleLogin}>Login</button>
//     </div>
//     :
//     <div className='card'>
//       <input placeholder='Enter new password' value={password} onChange={e => setPassword(e.target.value)} />
//       <br />
//       <button onClick={handleChallenge}>Save New Password</button>

//     </div>
//   )
// }

// export default App


//====================================================== CHECKPOINT 3 ======================================================================================================


src/App.js
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "./AuthContext";
import CustomLogin from "./CustomLogin";
import HomePage from "./pages/HomePage";
import ForumPage from "./pages/ForumPage";
import PostPage from "./pages/PostPage";
import CustomRegister from "./CustomRegister";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<CustomLogin />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum/:forumId"
          element={
            <ProtectedRoute>
              <ForumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:postId"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<CustomRegister />} />

      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
