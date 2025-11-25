// import React, { useState } from "react";
// import './App.css';

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const handleLogin = async () => {
//     const response = await fetch("http://localhost:4000/login",{
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });
//     const data = await response.json();
//     setMessage(data.message);
//   };

//   return (
//     <div className="login">
//       <h2>Login Using ExpressJS and NodeJS</h2>
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <br />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <br />
//       <button onClick={handleLogin}>Login</button>
//       <p>{message}</p>
//     </div>
//   );
// }


// import  { useState } from "react";
// import "./App.css";
// import axios from "axios";

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const handleLogin = async () => {
//     const api = axios.create({
//       baseURL: "http://localhost:4000", // your backend server URL
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     try {
//       const { data } = await api.post("/login", { username, password });

//       if (data.success) {
//         localStorage.setItem("fullname", data.fullname);
//         setMessage("Login successful!");
//         window.location.href = "/dashboard";
//       } else {
//         setMessage(data.message);
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setMessage("Server error");
//     }
//   };

//   return (
//     <div className="login">
//       <h2>Login Using React Typescript + ExpressJS + MySQL + Axios</h2>
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <br />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <br />
//       <button onClick={handleLogin}>Login</button>
//       <p>{message}</p>
//     </div>
//   );
// }



import { useState } from "react";
import "./App.css";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios from "axios";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const api = axios.create({
    baseURL: "http://localhost:4000",
    headers: { "Content-Type": "application/json" },
  });

  const handleLogin = async () => {
    try {
      const { data } = await api.post("/login", { username, password });
      if (data.success) {
        localStorage.setItem("fullname", data.fullname);
        localStorage.setItem("role", data.role);
        window.location.href = data.role === "admin" ? "/dashboard" : "/dashboardUser";
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Server error during login.");
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await api.post("/register", { username, password, role });
      if (data.success) {
        setMessage("✅ Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Server error during registration.");
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        setMessage("No Google credentials found");
        return;
      }

      const res = await axios.post("http://localhost:4000/google-login", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        localStorage.setItem("fullname", res.data.fullname);
        window.location.href = "/dashboard";
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setMessage("Google login failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId="1086691988405-opihco32qu4kn93c8hehopbfg73nb3ic.apps.googleusercontent.com">
      <div className="login">
        <h2>{isRegister ? "Create an Account" : "Welcome Back!"}</h2>
        <p style={{ color: "#ddd", marginBottom: "1.5rem" }}>
          {isRegister ? "Register using your details below" : "Login with your credentials"}
        </p>

        {isRegister ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleRegister}>Register</button>
            <p>
              Already have an account?{" "}
              <button onClick={() => setIsRegister(false)}>Login</button>
            </p>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            <hr />
            <h3>Or sign in with Google</h3>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setMessage("Google login failed")}
              />
            </div>
            <p>
              Don’t have an account?{" "}
              <button onClick={() => setIsRegister(true)}>Register</button>
            </p>
          </>
        )}

        {message && <p style={{ color: "#ffd6ff", marginTop: "10px" }}>{message}</p>}
      </div>
    </GoogleOAuthProvider>
  );
}
