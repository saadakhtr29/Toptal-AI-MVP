import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import "../styles/loginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      alert("Welcome back!");
      navigate("/dashboard");
    } catch (e) {
      alert("Login failed: " + e.message);
    }
  };

  return (
    <div className="login-page-wrapper">
    <div className="login-container">
      <img className="login-gif" src="../a4cf01a2edfaf1b62c83b31ab78361e5.gif" alt="Login-gif" />
      <div className="login-contents">
        <h1 className="login-header">Welcome back!</h1>
        <p className="login-text">
          Don’t have an account? <a className="signup-link" href="/signup">Sign up</a>
        </p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="login-inputs">
          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
          <button className="google-signin-btn">Sign in with Google</button>
        </div>
      </div>
    </div>
  </div>
  );
}
