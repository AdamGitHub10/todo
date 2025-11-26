import { useState } from "react";
import "./App.css";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
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
    baseURL: import.meta.env.VITE_API_URL, // ⭐ FOR VERCEL DEPLOYMENT
    headers: { "Content-Type": "application/json" },
  });

  const handleLogin = async () => {
    try {
      const { data } = await api.post("/login", { username, password });

      if (data.success) {
        localStorage.setItem("fullname", data.fullname);
        localStorage.setItem("role", data.role);

        window.location.href =
          data.role === "admin" ? "/dashboard" : "/dashboardUser";
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Server error during login.");
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !fullname || !email) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const { data } = await api.post("/register", {
        fullname,
        email,
        username,
        password,
        role,
      });

      if (data.success) {
        setMessage("✅ Registration successful! You may now log in.");
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
        setMessage("No Google credential found");
        return;
      }

      const res = await api.post("/google-login", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        localStorage.setItem("fullname", res.data.fullname);
        window.location.href = "/dashboard";
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setMessage("Google login failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID_HERE">
      <div className="login">
        <h2>{isRegister ? "Create an Account" : "Welcome Back!"}</h2>
        <p style={{ color: "#ddd", marginBottom: "1.5rem" }}>
          {isRegister
            ? "Register using your details below"
            : "Login with your credentials"}
        </p>

        {isRegister ? (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email address"
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

            <div style={{ display: "flex", justifyContent: "center" }}>
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

        {message && (
          <p style={{ color: "#ffd6ff", marginTop: "10px" }}>{message}</p>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
