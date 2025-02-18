// // App.js
// import React from "react";
// import { useAuth } from "react-oidc-context";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import TopicPage from "./pages/TopicPage";
// import PostPage from "./pages/PostPage";

// import { AppBar, Toolbar, Typography, Button } from "@mui/material";
// import { Box } from "@mui/system";

// function App() {
//   const auth = useAuth();

//   const signOutRedirect = () => {
//     const clientId = "1qj4he9g2rfu8bl1i3kuhm74r6";
//     const logoutUri = "<logout uri>";
//     const cognitoDomain = "https://us-east-1rlxwmq8po.auth.us-east-1.amazoncognito.com";
//     window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
//   };

//   if (auth.isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (auth.error) {
//     return <div>Error: {auth.error.message}</div>;
//   }

//   return (
//     <Router>
//       <header>
//         <nav>
//           <Link to="/">Home</Link>
//           {auth.isAuthenticated && (
//             <span style={{ marginLeft: "10px" }}>
//               Welcome, {auth.user?.profile.email}
//             </span>
//           )}
//           {auth.isAuthenticated ? (
//             <button onClick={() => auth.removeUser()} style={{ marginLeft: "10px" }}>
//               Sign Out
//             </button>
//           ) : (
//             <button onClick={() => auth.signinRedirect()} style={{ marginLeft: "10px" }}>
//               Sign In
//             </button>
//           )}
//         </nav>
//       </header>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/topic/:topicId" element={<TopicPage />} />
//         <Route path="/post/:postId" element={<PostPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



// App.js
import React from "react";
import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TopicPage from "./pages/TopicPage";
import PostPage from "./pages/PostPage";

// --- MUI IMPORTS ---
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Box } from "@mui/system";

function App() {
  const auth = useAuth();

  // removeUser() from OIDC only clears local session; to fully sign out from Cognito,
  // you could do a custom sign-out redirect. For your local sign-out, we redirect to the homepage.
  const handleSignOut = () => {
    auth.removeUser();             // Clears local auth
    window.location.href = "http://localhost:3000"; 
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  return (
    <Router>
      <header>
        {/* MUI NavBar */}
        <AppBar position="static">
          <Toolbar>
            {/* App "logo" / title. You can also wrap it in a Link to Home */}
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                My Forum
              </Link>
            </Typography>

            {/* If authenticated, show welcome text */}
            {auth.isAuthenticated && (
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {auth.user?.profile.email}
              </Typography>
            )}

            {/* Sign In / Sign Out button */}
            {auth.isAuthenticated ? (
              <Button color="inherit" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button color="inherit" onClick={() => auth.signinRedirect()}>
                Sign In
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </header>

      {/* App content */}
      <Box mt={2}> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/post/:postId" element={<PostPage />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
