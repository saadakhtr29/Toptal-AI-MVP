import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import "../styles/signupPage.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async () => {
    try {
      await signup(email, password);
      alert("Account created!");
      navigate("/dashboard");
    } catch (e) {
      alert("Signup failed: " + e.message);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container">
        <div className="signup-contents">
          <h1 className="signup-header">Let’s get you started</h1>
          <p className="signup-text">
            Already have an account? <a href="/login">Login</a>
          </p>
          <input
            className="firstname-field"
            type="text"
            placeholder="First name"
          />
          <input
            className="lastname-field"
            type="text"
            placeholder="Last name"
          />
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
          <button className="signup-btn" onClick={handleSignup}>
            Create Account
          </button>
          <button className="google-signup-btn">Sign up with Google</button>
        </div>

        <img
          className="signup-gif"
          src="../a4cf01a2edfaf1b62c83b31ab78361e5.gif"
          alt=""
        />
      </div>
    </div>
  );
}
